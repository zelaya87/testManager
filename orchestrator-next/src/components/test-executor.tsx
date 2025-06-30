"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Play,
  Square,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { electronService } from "@/services/electronService";
import { useSession } from "next-auth/react";
import { testHistoryService } from "@/services/testHistoryService";
import { KarateTest, ExecutionResult } from "@/types/karate-test";

interface TestExecutorProps {
  selectedTests: string[];
  tests: KarateTest[];
  isElectronMode?: boolean;
  projectId: string;
}

export default function TestExecutor({
  selectedTests,
  tests,
  isElectronMode = false,
  projectId,
}: TestExecutorProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>(
    []
  );
  const [progress, setProgress] = useState(0);
  const [generalReportUrl, setGeneralReportUrl] = useState<string | null>(null);
  const { data: session } = useSession();

  const selectedTestObjects = tests.filter((test) =>
    selectedTests.includes(test.id)
  );

  const handleExecute = async () => {
    if (selectedTests.length === 0) {
      toast.error("Selecione pelo menos um teste para executar");
      return;
    }

    if (!session?.user) {
      toast.error("Você precisa estar logado para executar testes");
      return;
    }

    setIsExecuting(true);
    setProgress(0);
    setExecutionResults([]);

    try {
      if (!isElectronMode) {
        toast.warning(
          "Execução simulada - Use o modo Electron para execução real"
        );
        await simulateExecution();
      } else {
        toast.success(
          `Iniciando execução de ${selectedTests.length} teste(s) no Karate`
        );
        await executeRealTests();
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const simulateExecution = async () => {
    for (let i = 0; i < selectedTests.length; i++) {
      const testId = selectedTests[i];
      const test = tests.find((t) => t.id === testId);

      setExecutionResults((prev) => [...prev, { testId, status: "running" }]);

      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 2000 + 1000)
      );

      const success = Math.random() > 0.3;
      const duration = Math.floor(Math.random() * 5000 + 500);

      const scenarioResults =
        test?.scenarios.map((scenario) => ({
          name: scenario,
          status: (Math.random() > 0.2 ? "passed" : "failed") as
            | "passed"
            | "failed",
        })) || [];

      setExecutionResults((prev) =>
        prev.map((result) =>
          result.testId === testId
            ? {
                ...result,
                status: success ? "passed" : "failed",
                duration,
                scenarios: scenarioResults,
              }
            : result
        )
      );

      setProgress(((i + 1) / selectedTests.length) * 100);
    }
  };

  const executeRealTests = async () => {
    try {
      const selectedPaths = selectedTests.map((testId) => {
        const test = tests.find((t) => t.id === testId);
        return test?.path || "";
      });

      const results = await electronService.runTests(selectedPaths);

      if (results.length > 0 && results[0].report) {
        setGeneralReportUrl(results[0].report);
      }

      const processedResults = selectedTests.map((testId, index) => {
        const electronResult = results[index];

        if (!electronResult) {
          return {
            testId,
            status: "failed" as const,
            error: "Resultado não encontrado",
          };
        }

        return {
          testId,
          status: electronResult.success ? "passed" : "failed",
          reportUrl: electronResult.report,
          error: electronResult.error,
          duration: electronResult.duration || 0,
        };
      });

      setExecutionResults(processedResults);
      setProgress(100);

      const passed = processedResults.filter(
        (r) => r.status === "passed"
      ).length;
      const failed = processedResults.length - passed;

      if (failed === 0) {
        toast.success(`Todos os ${selectedTests.length} testes passaram! 🎉`);
      } else {
        toast.error(
          `${failed} teste(s) falharam de ${selectedTests.length} executados`
        );
      }

      for (const result of processedResults) {
        const testExecution = await testHistoryService.createTestExecution({
          userId: session!.user.id,
          projectId,
          testName: result.testId,
          category: tests.find((t) => t.id === result.testId)?.category || "",
          status: result.status === "passed" ? "completed" : "error",
          startTime: new Date(),
        });

        await testHistoryService.updateTestExecution(testExecution.id, {
          status: result.status === "passed" ? "completed" : "error",
          endTime: new Date(),
          success: result.status === "passed",
          errorLog: result.error,
          reportPath: result.reportUrl,
          duration: result.duration,
        });
      }
    } catch (error) {
      toast.error("Erro durante a execução dos testes");
      console.error("Erro na execução:", error);

      setExecutionResults(
        selectedTests.map((testId) => ({
          testId,
          status: "failed" as const,
          error: "Erro na execução",
        }))
      );
    }
  };

  const handleStop = async () => {
    const stopped = await electronService.stopTestExecution();
    if (stopped) {
      setIsExecuting(false);
      setExecutionResults((prev) => {
        const updatedResults = [...prev];
        for (let i = 0; i < updatedResults.length; i++) {
          if (
            updatedResults[i].status === "pending" ||
            updatedResults[i].status === "running"
          ) {
            updatedResults[i] = {
              ...updatedResults[i],
              status: "failed",
              error: "Execução cancelada pelo usuário",
            };
          }
        }
        return updatedResults;
      });
      toast.warning(
        "Execução interrompida pelo usuário. Nenhum novo teste será iniciado."
      );
    } else {
      toast.error("Não foi possível interromper a execução");
    }
  };

  const handleOpenReport = (reportUrl: string) => {
    if (!reportUrl) return;

    if (isElectronMode) {
      electronService.openReport(reportUrl);
    } else {
      window.open(reportUrl, "_blank");
    }
  };

  const getStatusIcon = (status: ExecutionResult["status"]) => {
    switch (status) {
      case "running":
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (result: ExecutionResult) => {
    if (result.error === "Execução cancelada pelo usuário") {
      return "Cancelado";
    }
    switch (result.status) {
      case "running":
        return "Em execução";
      case "passed":
        return "Passou";
      case "failed":
        return result.error ? "Falhou" : "Cancelado";
      case "pending":
        return "Pendente";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {selectedTests.length > 0 && (
          <div className="bg-card/50 border border-border/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Testes Selecionados</h3>
              <Badge variant="secondary" className="bg-primary/5 text-primary">
                {selectedTests.length} teste(s)
              </Badge>
            </div>
            <div className="space-y-2">
              {selectedTestObjects.map((test) => (
                <div
                  key={test.id}
                  className="flex flex-col w-full bg-background/50 rounded-md p-3"
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium block truncate">
                        {test.name}
                      </span>
                      <span className="text-xs text-muted-foreground block truncate">
                        Cenário:{" "}
                        {test.path.split("/").pop()?.replace(".feature", "")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            variant={isExecuting ? "destructive" : "default"}
            size="lg"
            className={`w-full shadow-lg transition-all duration-200 ${
              isExecuting
                ? "bg-destructive/90 hover:bg-destructive"
                : "bg-primary/90 hover:bg-primary"
            }`}
            onClick={isExecuting ? handleStop : handleExecute}
            disabled={selectedTests.length === 0}
          >
            {isExecuting ? (
              <>
                <Square className="h-5 w-5 mr-2" />
                Parar Execução
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Executar {selectedTests.length} Teste(s)
              </>
            )}
          </Button>
        </div>

        {isExecuting && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round(progress)}% concluído
            </p>
          </div>
        )}

        {executionResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium">Resultados</h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary/5 text-primary"
                  >
                    {
                      executionResults.filter((r) => r.status === "passed")
                        .length
                    }{" "}
                    passou
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-destructive/5 text-destructive"
                  >
                    {
                      executionResults.filter((r) => r.status === "failed")
                        .length
                    }{" "}
                    falhou
                  </Badge>
                </div>
              </div>
              {generalReportUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenReport(generalReportUrl)}
                  className="text-xs hover:bg-primary/5 w-full sm:w-auto"
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Abrir Relatório Geral
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {executionResults.map((result) => {
                const test = tests.find((t) => t.id === result.testId);
                if (!test) return null;

                return (
                  <div
                    key={result.testId}
                    className={`bg-card/50 border border-border/50 rounded-lg p-4 ${
                      result.status === "running" ? "animate-pulse" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="mt-1 flex-shrink-0">
                            {getStatusIcon(result.status)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-sm font-medium truncate flex-1">
                                {test.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {getStatusText(result)}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground font-mono block truncate mt-1">
                              {test.path.split("/").pop()}
                            </span>
                          </div>
                        </div>
                        {result.reportUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenReport(result.reportUrl!)}
                            className="text-xs hover:bg-primary/5 flex-shrink-0 h-8 px-2"
                            title="Abrir Relatório"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {result.scenarios && result.scenarios.length > 0 && (
                        <div className="pt-1">
                          <div className="flex flex-wrap gap-2">
                            {result.scenarios.map((scenario, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className={`text-xs ${
                                  scenario.status === "passed"
                                    ? "bg-primary/5 text-primary"
                                    : "bg-destructive/5 text-destructive"
                                }`}
                              >
                                {scenario.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.error && (
                        <div className="text-xs text-red-600 font-mono bg-red-50 p-2 rounded">
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
