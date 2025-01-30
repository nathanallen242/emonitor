import type { ExtensionMonitorStore, ExtensionStats } from "~types/extension"

export class ExtensionStorage {
  private db: IDBDatabase | null = null
  private initialized = false

  constructor() {
    // No setup needed here; actual DB init done in init()
  }

  /**
   * Public initialization, preserving the same name "init()".
   */
  async init() {
    if (this.initialized) {
      return
    }
    await this.initIndexedDB()
    this.initialized = true
  }

  /**
   * Opens (and creates) the IndexedDB database and object stores.
   */
  private async initIndexedDB(): Promise<void> {
    if (this.db) {
      return
    }
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("extensionMonitorDB", 1)

      request.onupgradeneeded = () => {
        const db = request.result
        // Object store for individual extension stats
        if (!db.objectStoreNames.contains("extensionsStats")) {
          db.createObjectStore("extensionsStats", { keyPath: "extensionId" })
        }
        // Object store for global metadata like "lastUpdated"
        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata", { keyPath: "key" })
        }
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  /**
   * Preserves the same function signature and return type.
   * Returns the "store" object with an { extensions, lastUpdated } shape.
   */
  async getStore(): Promise<ExtensionMonitorStore> {
    await this.init()

    // 1) Retrieve all extensionStats from "extensionsStats".
    const extensions = await new Promise<Record<string, ExtensionStats>>((resolve, reject) => {
      const transaction = this.db.transaction(["extensionsStats"], "readonly")
      const store = transaction.objectStore("extensionsStats")
      const request = store.getAll()
      const result: Record<string, ExtensionStats> = {}

      request.onsuccess = () => {
        if (request.result) {
          // request.result is an array of items from the store
          for (const item of request.result as Array<ExtensionStats & { extensionId: string }>) {
            result[item.extensionId] = item
          }
        }
        resolve(result)
      }
      request.onerror = () => {
        reject(request.error)
      }
    })

    // 2) Retrieve the lastUpdated timestamp from "metadata".
    const lastUpdated = await new Promise<number>((resolve, reject) => {
      const transaction = this.db.transaction(["metadata"], "readonly")
      const store = transaction.objectStore("metadata")
      const request = store.get("global")

      request.onsuccess = () => {
        if (request.result && request.result.lastUpdated) {
          resolve(request.result.lastUpdated)
        } else {
          resolve(Date.now())
        }
      }
      request.onerror = () => {
        reject(request.error)
      }
    })

    return {
      extensions,
      lastUpdated
    }
  }

  /**
   * Persists or updates one extension’s stats.
   */
  async updateExtensionStats(extensionId: string, stats: ExtensionStats): Promise<void> {
    await this.init()

    // 1) Write the individual extension stats in the "extensionsStats" object store.
    await new Promise<void>((resolve, reject) => {
      const transaction = this.db.transaction(["extensionsStats"], "readwrite")
      const store = transaction.objectStore("extensionsStats")
      const data = { ...stats, extensionId }
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    // 2) Update the global "lastUpdated" time in the "metadata" store.
    await new Promise<void>((resolve, reject) => {
      const transaction = this.db.transaction(["metadata"], "readwrite")
      const store = transaction.objectStore("metadata")
      const request = store.put({
        key: "global",
        lastUpdated: Date.now()
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}
