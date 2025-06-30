import { TestRunnerInterface } from "./TestRunnerInterface";
import { KarateTestRunner } from "./KarateTestRunner";

export type TestFramework =
  | "KARATE"
  | "GATLING"
  | "SELENIUM"
  | "CYPRESS"
  | "PLAYWRIGHT";

export class TestRunnerFactory {
  private static runners: Map<TestFramework, TestRunnerInterface> = new Map();

  static getRunner(framework: TestFramework): TestRunnerInterface {
    let runner = this.runners.get(framework);

    if (!runner) {
      runner = TestRunnerFactory.createRunner(framework);
      this.runners.set(framework, runner);
    }

    return runner;
  }

  private static createRunner(framework: TestFramework): TestRunnerInterface {
    switch (framework) {
      case "KARATE":
        return new KarateTestRunner();
      // Adicione outros runners conforme necessário
      // case 'GATLING':
      //   return new GatlingTestRunner();
      // case 'SELENIUM':
      //   return new SeleniumTestRunner();
      // case 'CYPRESS':
      //   return new CypressTestRunner();
      // case 'PLAYWRIGHT':
      //   return new PlaywrightTestRunner();
      default:
        throw new Error(`Test framework ${framework} not supported`);
    }
  }

  static async initializeRunner(
    framework: TestFramework,
    projectPath: string,
    config: any
  ): Promise<TestRunnerInterface> {
    const runner = this.getRunner(framework);
    await runner.initialize(projectPath, config);
    return runner;
  }

  static clearRunners(): void {
    this.runners.clear();
  }
}
