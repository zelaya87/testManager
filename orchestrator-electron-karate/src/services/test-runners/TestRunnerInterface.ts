export interface TestConfig {
  environment: string;
  variables: Record<string, any>;
  timeout?: number;
  retries?: number;
  parallel?: boolean;
  tags?: string[];
  [key: string]: any;
}

export interface TestResult {
  success: boolean;
  duration: number;
  error?: string;
  reportPath?: string;
  metrics?: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
    [key: string]: any;
  };
}

export interface TestRunnerInterface {
  // Configuração inicial do runner
  initialize(projectPath: string, config: TestConfig): Promise<void>;

  // Validação do projeto
  validateProject(): Promise<boolean>;

  // Listagem de testes disponíveis
  listTests(): Promise<
    Array<{
      name: string;
      path: string;
      type: string;
      category: string;
      tags: string[];
    }>
  >;

  // Execução de testes
  runTests(tests: string[], config?: Partial<TestConfig>): Promise<TestResult>;

  // Parar execução
  stopTests(): Promise<void>;

  // Limpeza de recursos
  cleanup(): Promise<void>;

  // Gerenciamento de dependências
  getDependencies(): Promise<
    Array<{
      name: string;
      version: string;
      type: string;
    }>
  >;

  // Geração de relatórios
  generateReport(results: TestResult[]): Promise<string>;
}
