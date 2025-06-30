import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BarChart,
  TrendingUp,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { analyticsService } from "@/core/analytics/service";
import { TestReport, AIAnalysis } from "@/core/analytics/types";

const Insights = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month"
  >("week");
  const [reports, setReports] = useState<TestReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // TODO: Implementar carregamento real dos relatórios
      const mockReport: TestReport = await analyticsService.generateReport(
        "mock-execution",
        "detailed"
      );
      setReports([mockReport]);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInsightCard = (
    insight: AIAnalysis["analysis"]["insights"][0]
  ) => (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
          </CardTitle>
          <Badge
            variant={
              insight.severity === "high"
                ? "destructive"
                : insight.severity === "medium"
                ? "secondary"
                : "default"
            }
          >
            {insight.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{insight.description}</p>
        <p className="text-sm font-medium mt-2">{insight.recommendation}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 dark:from-background dark:to-background/90">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card/50 backdrop-blur-sm rounded-xl p-6 border shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/5"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5 text-primary" />
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Insights & Analytics
              </h1>
            </div>
            <p className="text-muted-foreground">
              Análise detalhada e insights baseados em IA de todas as execuções
              de teste
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={selectedPeriod === "day" ? "bg-primary/10" : ""}
              onClick={() => setSelectedPeriod("day")}
            >
              24h
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={selectedPeriod === "week" ? "bg-primary/10" : ""}
              onClick={() => setSelectedPeriod("week")}
            >
              7 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={selectedPeriod === "month" ? "bg-primary/10" : ""}
              onClick={() => setSelectedPeriod("month")}
            >
              30 dias
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Métricas Principais */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  Métricas Principais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-background/50">
                    <p className="text-sm text-muted-foreground">
                      Taxa de Sucesso Média
                    </p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      94.8%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      +2.3% vs período anterior
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50">
                    <p className="text-sm text-muted-foreground">
                      Tempo de Resposta Médio
                    </p>
                    <p className="text-2xl font-bold text-accent mt-1">245ms</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      -12ms vs período anterior
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50">
                    <p className="text-sm text-muted-foreground">
                      Cobertura de Testes
                    </p>
                    <p className="text-2xl font-bold text-primary mt-1">87%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      +5% vs período anterior
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tendências */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Tendências
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Gráfico de tendências será implementado aqui
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights da IA */}
          <div className="lg:col-span-1">
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Insights da IA
                </CardTitle>
                <CardDescription>
                  Análises e recomendações baseadas em IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reports[0]?.content.aiAnalysis.analysis.insights.map(
                  (insight, index) => (
                    <div key={index} className="space-y-4">
                      {renderInsightCard(insight)}
                    </div>
                  )
                )}

                {(!reports.length ||
                  !reports[0]?.content.aiAnalysis.analysis.insights.length) && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum insight disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detalhes por Ferramenta */}
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Detalhes por Ferramenta</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="karate">
              <TabsList>
                <TabsTrigger value="karate">Karate</TabsTrigger>
                <TabsTrigger value="gatling">Gatling</TabsTrigger>
              </TabsList>
              <TabsContent value="karate" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-background/50">
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Cenários Mais Executados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {["Login Flow", "Product Search", "Checkout"].map(
                          (scenario) => (
                            <div
                              key={scenario}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">{scenario}</span>
                              <Badge variant="secondary">98% sucesso</Badge>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/50">
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Falhas Mais Comuns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[
                          "Timeout em API",
                          "Validação de Schema",
                          "Auth Token",
                        ].map((failure) => (
                          <div
                            key={failure}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{failure}</span>
                            <Badge variant="destructive">12 ocorrências</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="gatling" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-background/50">
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Métricas de Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {["Response Time", "Throughput", "Error Rate"].map(
                          (metric) => (
                            <div
                              key={metric}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">{metric}</span>
                              <Badge variant="secondary">
                                Dentro do limite
                              </Badge>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/50">
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Pontos de Atenção
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {["CPU Usage", "Memory Leak", "Connection Pool"].map(
                          (issue) => (
                            <div
                              key={issue}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">{issue}</span>
                              <Badge variant="secondary">Monitorando</Badge>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
