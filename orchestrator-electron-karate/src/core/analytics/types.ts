export interface TestExecution {
  id: string;
  toolType: "karate" | "gatling" | string; // Extensível para novas ferramentas
  startTime: string;
  endTime?: string;
  status: "running" | "completed" | "failed";
  metadata: Record<string, any>;
}

export interface TestMetrics {
  executionId: string;
  timestamp: string;
  metrics: {
    success: {
      rate: number;
      count: number;
      total: number;
    };
    performance: {
      meanResponseTime: number;
      p95ResponseTime: number;
      throughput: number;
    };
    coverage: {
      features?: number;
      scenarios?: number;
      endpoints?: number;
    };
    custom: Record<string, any>; // Métricas específicas de cada ferramenta
  };
}

export interface AIAnalysis {
  executionId: string;
  timestamp: string;
  analysis: {
    summary: string;
    insights: Array<{
      type:
        | "performance"
        | "reliability"
        | "security"
        | "functionality"
        | string;
      severity: "low" | "medium" | "high";
      description: string;
      recommendation: string;
    }>;
    trends: Array<{
      metric: string;
      trend: "improving" | "stable" | "degrading";
      description: string;
    }>;
    anomalies: Array<{
      metric: string;
      description: string;
      possibleCauses: string[];
      recommendations: string[];
    }>;
  };
}

export interface TestReport {
  id: string;
  executionId: string;
  generatedAt: string;
  type: "detailed" | "summary" | "comparison";
  content: {
    metrics: TestMetrics;
    aiAnalysis: AIAnalysis;
    visualizations: Array<{
      type: string;
      title: string;
      description: string;
      data: any;
    }>;
    recommendations: Array<{
      category: string;
      priority: "low" | "medium" | "high";
      description: string;
      actionItems: string[];
    }>;
  };
}
