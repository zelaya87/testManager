interface ElectronAPI {
  selectMavenProject: () => Promise<{ success: boolean; projectRoot: string }>;
  runTests: (paths: string[]) => Promise<
    Array<{
      success: boolean;
      report?: string;
      error?: string;
      duration?: number;
    }>
  >;
  stopTestExecution: () => Promise<{ success: boolean; error?: string }>;
  openReport: (path: string) => Promise<{ success: boolean; error?: string }>;
  listDataFiles: (featurePath: string) => Promise<{
    dataFiles: string[];
    descriptionFiles: string[];
  }>;
  readFileContent: (path: string) => Promise<string>;
  saveCSVFile: (args: { path: string; content: string }) => Promise<string>;
  uploadFile: (args: {
    path: string;
    content: ArrayBuffer;
  }) => Promise<{ success: boolean }>;
  downloadFile: (
    filePath: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteFile: (
    filePath: string
  ) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
