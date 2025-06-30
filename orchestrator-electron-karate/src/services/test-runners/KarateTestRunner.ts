import {
  TestRunnerInterface,
  TestConfig,
  TestResult,
} from "./TestRunnerInterface";
import { electronService } from "../electronService";

export class KarateTestRunner implements TestRunnerInterface {
  private projectPath: string;
  private config: TestConfig;

  async initialize(projectPath: string, config: TestConfig): Promise<void> {
    this.projectPath = projectPath;
    this.config = config;

    const result = await electronService.selectMavenProject();
    if (!result.success) {
      throw new Error("Failed to initialize Karate project");
    }
  }

  async validateProject(): Promise<boolean> {
    try {
      const features = await electronService.getFeatureTests();
      return features && features.length > 0;
    } catch {
      return false;
    }
  }

  async listTests() {
    const features = await electronService.getFeatureTests();
    return features.map((feature) => ({
      name: feature.scenarioName,
      path: feature.feature,
      type: "API",
      category: feature.category,
      tags: [],
    }));
  }

  async runTests(
    tests: string[],
    config?: Partial<TestConfig>
  ): Promise<TestResult> {
    const mergedConfig = { ...this.config, ...config };

    try {
      const result = await electronService.runTests(tests);

      return {
        success: result.success,
        duration: result.duration || 0,
        error: result.error,
        reportPath: result.reportPath,
        metrics: {
          passed: result.passed || 0,
          failed: result.failed || 0,
          skipped: result.skipped || 0,
          total: result.total || 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        duration: 0,
        error: error.message,
        metrics: {
          passed: 0,
          failed: 1,
          skipped: 0,
          total: 1,
        },
      };
    }
  }

  async stopTests(): Promise<void> {
    await electronService.stopTestExecution();
  }

  async cleanup(): Promise<void> {
    // Implementar limpeza de recursos se necessário
  }

  async getDependencies() {
    // No futuro, podemos implementar a leitura do pom.xml
    return [
      {
        name: "com.intuit.karate",
        version: "latest",
        type: "LIBRARY",
      },
    ];
  }

  async generateReport(results: TestResult[]): Promise<string> {
    // O Karate já gera seus próprios relatórios
    return results[0]?.reportPath || "";
  }
}
