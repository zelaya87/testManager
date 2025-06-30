export interface GatlingSimulation {
  id: string;
  name: string;
  description: string;
  path: string;
  configuration: {
    users: number;
    rampUpTime: number;
    duration: number;
    targetUrl: string;
  };
  lastExecution?: {
    date: string;
    successRate: number;
    avgResponseTime: number;
    requestsPerSecond: number;
  };
}

export interface GatlingExecution {
  id: string;
  simulationId: string;
  simulationName: string;
  startTime: string;
  endTime?: string;
  status: "running" | "completed" | "failed";
  metrics: {
    successRate: number;
    avgResponseTime: number;
    requestsPerSecond: number;
    totalRequests: number;
    activeUsers: number;
  };
}

export interface GatlingMetrics {
  timestamp: string;
  metrics: {
    activeUsers: number;
    requestsPerSecond: number;
    responseTime: {
      min: number;
      max: number;
      mean: number;
      p95: number;
    };
    successRate: number;
    errorRate: number;
  };
}
