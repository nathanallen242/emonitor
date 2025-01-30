import { ExtensionStorage } from "~storage"
import type { TrackedExtensionInfo, ExtensionStats } from "~types/extension"

class ExtensionMonitor {
  private storage: ExtensionStorage
  private activeExtensions: Map<string, TrackedExtensionInfo> = new Map()

  constructor() {
    this.storage = new ExtensionStorage()
    this.initializeMonitoring()
  }

  private async initializeMonitoring() {
    await this.updateExtensionList()
    
    chrome.management.onInstalled.addListener(() => this.updateExtensionList())
    chrome.management.onUninstalled.addListener(() => this.updateExtensionList())
    chrome.management.onEnabled.addListener(() => this.updateExtensionList())
    chrome.management.onDisabled.addListener(() => this.updateExtensionList())

    chrome.webRequest.onCompleted.addListener(
      this.handleWebRequest.bind(this),
      { urls: ["<all_urls>"] }
    )

    // this.startPerformanceMonitoring();
  }

  // private startPerformanceMonitoring() {
  //   setInterval(async () => {
  //     try {
  //       const processes = await new Promise<chrome.processes.ProcessMap>((resolve) => {
  //         chrome.processes.getProcessInfo((processes) => {
  //           resolve(processes);
  //         });
  //       });
  
  //       const extensionsMap = new Map<string, { 
  //         cpu: number; 
  //         memory: number;
  //       }>();
  
  //       Object.values(processes).forEach((process) => {
  //         if (process.type === 'extension') {
  //           process.tasks.forEach((task) => {
  //             if (task.frame?.url?.startsWith('chrome-extension://')) {
  //               const extensionId = new URL(task.frame.url).hostname;
  //               const current = extensionsMap.get(extensionId) || { 
  //                 cpu: 0, 
  //                 memory: 0 
  //               };
                
  //               extensionsMap.set(extensionId, {
  //                 cpu: current.cpu + (process.cpu || 0),
  //                 memory: current.memory + (
  //                   process.memory?.privateMemory || 
  //                   process.privateMemory || 
  //                   0
  //                 )
  //               });
  //             }
  //           });
  //         }
  //       });
  
  //       if (extensionsMap.size > 0) {
  //         const extensionProcessIds = Object.values(processes)
  //           .filter(p => p.type === 'extension')
  //           .map(p => p.id);
  
  //         if (extensionProcessIds.length > 0) {
  //           const detailedProcesses = await new Promise<chrome.processes.ProcessMap>((resolve) => {
  //             chrome.processes.getProcessInfo(extensionProcessIds, true, (processes) => {
  //               resolve(processes);
  //             });
  //           });
  
  //           Object.values(detailedProcesses).forEach((process) => {
  //             process.tasks.forEach((task) => {
  //               if (task.frame?.url?.startsWith('chrome-extension://')) {
  //                 const extensionId = new URL(task.frame.url).hostname;
  //                 const current = extensionsMap.get(extensionId);
  //                 if (current) {
  //                   extensionsMap.set(extensionId, {
  //                     ...current,
  //                     memory: current.memory + (
  //                       process.memory?.privateMemory || 
  //                       process.privateMemory || 
  //                       0
  //                     )
  //                   });
  //                 }
  //               }
  //             });
  //           });
  //         }
  //       }
  
  //       for (const [extensionId, metrics] of extensionsMap) {
  //         if (!this.activeExtensions.has(extensionId)) continue;
  
  //         const stats = await this.getOrCreateExtensionStats(
  //           extensionId,
  //           this.activeExtensions.get(extensionId)
  //         );
  
  //         stats.performance = {
  //           lastUpdated: Date.now(),
  //           cpu: metrics.cpu,
  //           memory: metrics.memory
  //         };
  
  //         stats.network.performanceUpdates = (stats.network.performanceUpdates || 0) + 1;
  //         await this.storage.updateExtensionStats(extensionId, stats);
  //       }
  //     } catch (error) {
  //       console.error('Performance monitoring error:', error);
  //     }
  //   }, 10000);
  // }

  private async updateExtensionList() {
    const extensions = await chrome.management.getAll()
    
    for (const ext of extensions) {
      if (ext.id === chrome.runtime.id) continue

      const trackedInfo: TrackedExtensionInfo = {
        ...ext,
        lastUpdated: Date.now(),
        isTracked: true
      }

      this.activeExtensions.set(ext.id, trackedInfo)
      const currentStats = await this.getOrCreateExtensionStats(ext.id, trackedInfo)
      await this.storage.updateExtensionStats(ext.id, currentStats)
    }
  }

  private async getOrCreateExtensionStats(
    extensionId: string, 
    extensionInfo: TrackedExtensionInfo
  ): Promise<ExtensionStats> {
    const store = await this.storage.getStore()
    
    return store.extensions[extensionId] || {
      extension: extensionInfo,
      network: {
        extensionId,
        totalRequests: 0,
        requestsByType: {},
        requestsByDomain: {},
        lastRequest: Date.now(),
        firstTracked: Date.now(),
        performanceUpdates: 0
      },
      performance: {
        lastUpdated: 0,
        cpu: 0,
        memory: 0
      }
    };
  }

  private async handleWebRequest(details: chrome.webRequest.WebResponseDetails) {
    if (!details.initiator?.startsWith("chrome-extension://")) return

    const extensionId = details.initiator.split("/")[2]
    if (!this.activeExtensions.has(extensionId)) return

    const stats = await this.getOrCreateExtensionStats(
      extensionId,
      this.activeExtensions.get(extensionId)
    )

    const network = stats.network
    network.totalRequests++
    network.lastRequest = Date.now()
    network.requestsByType[details.type] = 
      (network.requestsByType[details.type] || 0) + 1

    const domain = new URL(details.url).hostname
    network.requestsByDomain[domain] = 
      (network.requestsByDomain[domain] || 0) + 1

    await this.storage.updateExtensionStats(extensionId, stats)
  }
}

const monitor = new ExtensionMonitor()

export {}
