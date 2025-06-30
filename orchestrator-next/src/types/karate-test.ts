export interface KarateTest {
  id: string;
  name: string;
  path: string;
  category: string;
  scenarios: string[];
  enabled: boolean;
  dataFiles?: string[];
}

export interface TestExecutionResult {
  success: boolean;
  report?: string;
  error?: string;
  duration?: number;
}

export interface ExecutionResult {
  testId: string;
  status: "running" | "passed" | "failed" | "pending";
  duration?: number;
  scenarios?: { name: string; status: "passed" | "failed" }[];
  reportUrl?: string;
  error?: string;
}
