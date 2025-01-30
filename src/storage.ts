import { SecureStorage } from "@plasmohq/storage/secure"
import type { ExtensionMonitorStore, ExtensionStats } from "~types/extension"

export class ExtensionStorage {
  private storage: SecureStorage
  private initialized: boolean = false

  constructor() {
    this.storage = new SecureStorage()
  }

  async init() {
    if (this.initialized) return
    await this.storage.setPassword("test_password_123") // TODO: Replace with secure password handling
    this.initialized = true
  }

  async getStore(): Promise<ExtensionMonitorStore> {
    await this.init()
    const store = await this.storage.get("extensionStore")
    const defaultStore = { extensions: {}, lastUpdated: Date.now() }
    return store ? JSON.parse(store as string) : defaultStore
  }

  async updateExtensionStats(extensionId: string, stats: ExtensionStats) {
    await this.init()
    const store = await this.getStore()
    store.extensions[extensionId] = stats
    store.lastUpdated = Date.now()
    await this.storage.set("extensionStore", JSON.stringify(store))
  }
}