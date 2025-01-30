import { ExtensionStorage } from "./storage"
import type { 
  TrackedExtensionInfo, 
  ExtensionStats 
} from "~types/extension"

class ExtensionMonitor {
  private storage: ExtensionStorage
  private activeExtensions: Map<string, TrackedExtensionInfo> = new Map()

  constructor() {
    this.storage = new ExtensionStorage()
    this.initializeMonitoring()
  }

  private async initializeMonitoring() {
    // Initialize extension tracking
    await this.updateExtensionList()
    
    // Set up listeners
    chrome.management.onInstalled.addListener(() => this.updateExtensionList())
    chrome.management.onUninstalled.addListener(() => this.updateExtensionList())
    chrome.management.onEnabled.addListener(() => this.updateExtensionList())
    chrome.management.onDisabled.addListener(() => this.updateExtensionList())

    // Set up network request monitoring
    chrome.webRequest.onCompleted.addListener(
      this.handleWebRequest.bind(this),
      { urls: ["<all_urls>"] }
    )
  }

  private async updateExtensionList() {
    const extensions = await chrome.management.getAll()
    
    for (const ext of extensions) {
      if (ext.id === chrome.runtime.id) continue // Skip self

      const trackedInfo: TrackedExtensionInfo = {
        ...ext,
        lastUpdated: Date.now(),
        isTracked: true
      }

      this.activeExtensions.set(ext.id, trackedInfo)

      // Initialize or update storage
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
        firstTracked: Date.now()
      }
    }
  }

  private async handleWebRequest(details: chrome.webRequest.WebResponseDetails) {
    if (!details.initiator?.startsWith('chrome-extension://')) return

    const extensionId = details.initiator.split('/')[2]
    if (!this.activeExtensions.has(extensionId)) return

    const stats = await this.getOrCreateExtensionStats(
      extensionId,
      this.activeExtensions.get(extensionId)
    )

    // Update network stats
    const network = stats.network
    network.totalRequests++
    network.lastRequest = Date.now()
    
    // Update request type count
    network.requestsByType[details.type] = 
      (network.requestsByType[details.type] || 0) + 1

    // Update domain count
    const domain = new URL(details.url).hostname
    network.requestsByDomain[domain] = 
      (network.requestsByDomain[domain] || 0) + 1

    await this.storage.updateExtensionStats(extensionId, stats)
  }
}

// Initialize monitoring
const monitor = new ExtensionMonitor()

export {}