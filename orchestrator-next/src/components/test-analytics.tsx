"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TestAnalyticsProps {
  projectId?: string;
  teamId?: string;
}

interface TestAnalysis {
  id: string;
  projectId: string;
  executionId?: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  riskAreas: string[];
  performanceMetrics: {
    [key: string]: any;
  };
  aiModel?: string;
  createdAt: Date;
  project: {
    name: string;
  };
}

interface AnalyticsData {
  summary: {
    successRate: number;
    averageDuration: number;
    totalTests: number;
  };
  executionHistory: Array<{
    startTime: string;
    success: boolean;
  }>;
  recentAnalysis: TestAnalysis[];
}

export default function TestAnalytics({
  projectId,
  teamId,
}: TestAnalyticsProps) {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadAnalytics();
    }
  }, [session, projectId, teamId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      let endpoint = "/api/analytics";

      if (projectId) {
        endpoint += `/project/${projectId}`;
      } else if (teamId) {
        endpoint += `/team/${teamId}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Erro ao carregar análises");
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando análises...</div>;
  }

  if (!analytics) {
    return <div>Nenhuma análise disponível.</div>;
  }

  const successRateData = analytics.executionHistory?.map((history) => ({
    date: new Date(history.startTime).toLocaleDateString(),
    rate: history.success ? 100 : 0,
  }));

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Sucesso</CardTitle>
              <CardDescription>Média dos últimos testes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(analytics.summary.successRate * 100).toFixed(1)}%
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={successRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tempo Médio</CardTitle>
              <CardDescription>Duração média dos testes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(analytics.summary.averageDuration / 1000).toFixed(1)}s
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total de Testes</CardTitle>
              <CardDescription>Número de execuções</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.summary.totalTests}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="insights">
        <Card>
          <CardHeader>
            <CardTitle>Insights da IA</CardTitle>
            <CardDescription>
              Análises e recomendações baseadas nos resultados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {analytics.recentAnalysis?.map((analysis) => (
                <div
                  key={analysis.id}
                  className="mb-6 p-4 border rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{analysis.project.name}</h3>
                    <Badge variant="outline">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {analysis.summary}
                    </p>

                    <div>
                      <h4 className="font-medium mb-2">Insights Principais:</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {analysis.insights.map((insight, i) => (
                          <li key={i} className="text-sm">
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recomendações:</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {analysis.riskAreas.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Áreas de Risco:</h4>
                        <div className="flex gap-2 flex-wrap">
                          {analysis.riskAreas.map((area, i) => (
                            <Badge key={i} variant="destructive">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="performance">
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Performance</CardTitle>
            <CardDescription>
              Análise detalhada do desempenho dos testes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Implementar visualização de métricas de performance */}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
