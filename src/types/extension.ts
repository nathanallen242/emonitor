export type ChromeExtensionInfo = chrome.management.ExtensionInfo;

// Our tracking type that extends Chrome's ExtensionInfo
export interface TrackedExtensionInfo extends ChromeExtensionInfo {
  lastUpdated: number;  // timestamp of last data update
  isTracked: boolean;   // whether we're actively monitoring this extension
}

// Network request aggregation data structure
export interface ExtensionNetworkStats {
  extensionId: string;
  totalRequests: number;
  requestsByType: {
    [key in chrome.webRequest.ResourceType]?: number;
  };
  requestsByDomain: {
    [domain: string]: number;
  };
  lastRequest: number;      // timestamp of most recent request
  firstTracked: number;     // timestamp when we started tracking
  cpuUsage?: number;       // percentage of CPU used
  memoryUsage?: number;    // memory in bytes
  performanceUpdates: number; // count of performance updates collected
}

// Combined stats for storage
export interface ExtensionStats {
  extension: TrackedExtensionInfo;
  network: ExtensionNetworkStats;
  performance: {
    lastUpdated: number;
    cpu: number;
    memory: number;
  };
}

// For storing all extension data
export interface ExtensionMonitorStore {
  extensions: {
    [extensionId: string]: ExtensionStats;
  };
  lastUpdated: number;
}