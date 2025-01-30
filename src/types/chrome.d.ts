// declare namespace chrome.processes {
//   interface ProcessMemoryInfo {
//     privateMemory?: number;
//     jsMemoryAllocated?: number;
//     jsMemoryUsed?: number;
//     sqLiteMemoryUsed?: number;
//     peakPrivateMemory?: number;
//     workingSetSize?: number;
//   }

//   interface TaskInfo {
//     title?: string;
//     taskId: number;
//     tabId?: number;
//     processId: number;
//     frameId?: number;
//     parentFrameId?: number;
//     frame?: {
//       url?: string;
//       parentFrameId?: number;
//       processId?: number;
//     };
//   }

//   interface ProcessInfo {
//     id: number;
//     osProcessId: number;
//     title: string;
//     type?: 'browser' | 'renderer' | 'extension' | 'notification' | 'plugin' | 'worker' | 'nacl' | 'utility' | 'gpu' | 'other';
//     cpu?: number;
//     network?: {
//       network?: number;
//     };
//     memory?: ProcessMemoryInfo;
//     tasks: TaskInfo[];
//     privateMemory?: number;
//   }

//   type ProcessMap = { [key: string]: ProcessInfo };

//   /**
//    * Retrieves the process information for all processes
//    * @param callback Called when the process information is available
//    */
//   function getProcessInfo(callback: (processes: ProcessMap) => void): void;

//   /**
//    * Retrieves the process information for specific processes
//    * @param processIds The list of process IDs or a single process ID
//    * @param callback Called when the process information is available
//    */
//   function getProcessInfo(
//     processIds: number | number[],
//     callback: (processes: ProcessMap) => void
//   ): void;

//   /**
//    * Retrieves the process information with additional memory information
//    * @param processIds The list of process IDs or a single process ID
//    * @param includeMemory Whether to include memory information
//    * @param callback Called when the process information is available
//    */
//   function getProcessInfo(
//     processIds: number | number[],
//     includeMemory: boolean,
//     callback: (processes: ProcessMap) => void
//   ): void;

//   const onUpdated: chrome.events.Event<(processes: ProcessMap) => void>;
//   const onUpdatedWithMemory: chrome.events.Event<(processes: ProcessMap) => void>;
//   const onCreated: chrome.events.Event<(processId: number) => void>;
//   const onUnresponsive: chrome.events.Event<(processId: number) => void>;
//   const onResponsive: chrome.events.Event<(processId: number) => void>;
// }