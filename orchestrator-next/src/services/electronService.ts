import { KarateTest, TestExecutionResult } from "@/types/karate-test";

interface ElectronAPI {
  selectMavenProject: () => Promise<{
    success: boolean;
    projectRoot?: string;
    error?: string;
  }>;
  getFeatureTests: () => Promise<KarateTest[]>;
  runTests: (paths: string[]) => Promise<TestExecutionResult[]>;
  listDataFiles: (path: string) => Promise<string[]>;
  readFileContent: (path: string) => Promise<string>;
  openReport: (reportPath: string) => Promise<void>;
  saveCsvFile: (args: { path: string; content: string }) => Promise<void>;
  uploadFile: (args: { path: string; content: string }) => Promise<void>;
  downloadFile: (path: string) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
  stopTestExecution: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

class ElectronService {
  private static instance: ElectronService;
  private _isElectronMode: boolean;

  private constructor() {
    this._isElectronMode = this.checkElectronMode();
  }

  public static getInstance(): ElectronService {
    if (!ElectronService.instance) {
      ElectronService.instance = new ElectronService();
    }
    return ElectronService.instance;
  }

  private checkElectronMode(): boolean {
    if (typeof window === "undefined") return false;
    return !!window.electronAPI;
  }

  get isElectronMode(): boolean {
    return this._isElectronMode;
  }

  async selectMavenProject(): Promise<{
    success: boolean;
    projectRoot?: string;
    error?: string;
  }> {
    if (!this.isElectronMode) {
      return { success: false, error: "Electron não disponível" };
    }

    try {
      return await window.electronAPI!.selectMavenProject();
    } catch (error) {
      console.error("❌ Erro ao selecionar projeto:", error);
      return { success: false, error: "Erro ao selecionar projeto" };
    }
  }

  async getFeatureTests(): Promise<KarateTest[]> {
    if (!this.isElectronMode) {
      return [];
    }

    try {
      return await window.electronAPI!.getFeatureTests();
    } catch (error) {
      console.error("❌ Erro ao obter testes:", error);
      return [];
    }
  }

  async runTests(paths: string[]): Promise<TestExecutionResult[]> {
    if (!this.isElectronMode) {
      return [];
    }

    try {
      return await window.electronAPI!.runTests(paths);
    } catch (error) {
      console.error("❌ Erro ao executar testes:", error);
      return [];
    }
  }

  async listDataFiles(path: string): Promise<string[]> {
    if (!this.isElectronMode) {
      return [];
    }

    try {
      return await window.electronAPI!.listDataFiles(path);
    } catch (error) {
      console.error("❌ Erro ao listar arquivos de dados:", error);
      return [];
    }
  }

  async readFileContent(path: string): Promise<string> {
    if (!this.isElectronMode) {
      return "";
    }

    try {
      return await window.electronAPI!.readFileContent(path);
    } catch (error) {
      console.error("❌ Erro ao ler conteúdo do arquivo:", error);
      return "";
    }
  }

  async openReport(reportPath: string): Promise<void> {
    if (!this.isElectronMode) {
      return;
    }

    try {
      await window.electronAPI!.openReport(reportPath);
    } catch (error) {
      console.error("❌ Erro ao abrir relatório:", error);
    }
  }

  async stopTestExecution(): Promise<boolean> {
    if (!this.isElectronMode) {
      return false;
    }

    try {
      return await window.electronAPI!.stopTestExecution();
    } catch (error) {
      console.error("❌ Erro ao parar execução:", error);
      return false;
    }
  }
}

export const electronService = ElectronService.getInstance();
