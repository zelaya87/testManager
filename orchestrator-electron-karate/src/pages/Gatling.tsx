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
import { ArrowLeft, Gauge, Upload, Play, History, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { gatlingService } from "@/services/gatlingService";
import { GatlingSimulation } from "@/types/GatlingTest";
import { toast } from "sonner";

const Gatling = () => {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState<GatlingSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    setIsLoading(true);
    try {
      const loadedSimulations = await gatlingService.loadSimulations();
      setSimulations(loadedSimulations);
    } catch (error) {
      console.error("Erro ao carregar simulações:", error);
      toast.error("Erro ao carregar simulações");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSimulation = async () => {
    try {
      // TODO: Implementar seleção de arquivo
      const filePath = "/path/to/simulation.scala";
      const simulation = await gatlingService.importSimulation(filePath);
      setSimulations((prev) => [...prev, simulation]);
      toast.success("Simulação importada com sucesso");
    } catch (error) {
      console.error("Erro ao importar simulação:", error);
      toast.error("Erro ao importar simulação");
    }
  };

  const handleRunSimulation = async (simulation: GatlingSimulation) => {
    try {
      const executionId = await gatlingService.runSimulation(
        simulation.id,
        simulation.configuration
      );
      toast.success("Simulação iniciada com sucesso");
      // TODO: Implementar monitoramento da execução
    } catch (error) {
      console.error("Erro ao executar simulação:", error);
      toast.error("Erro ao executar simulação");
    }
  };

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
                className="hover:bg-accent/5"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5 text-accent" />
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Gatling Tests
              </h1>
            </div>
            <p className="text-muted-foreground">
              Execute e monitore testes de performance com Gatling
            </p>
          </div>
          <Button
            variant="default"
            size="lg"
            className="bg-accent/90 hover:bg-accent shadow-lg transition-all duration-200 ease-in-out"
            onClick={handleImportSimulation}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Upload className="h-5 w-5 mr-2" />
            )}
            Importar Simulação
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Simulations */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-accent" />
                  Simulações Disponíveis
                </CardTitle>
                <CardDescription>
                  Selecione uma simulação para executar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {simulations.map((simulation) => (
                    <div
                      key={simulation.id}
                      className="p-4 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{simulation.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {simulation.description}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-accent/10 text-accent"
                        >
                          {simulation.configuration.users} usuários
                        </Badge>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-accent/90 hover:bg-accent"
                          onClick={() => handleRunSimulation(simulation)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Executar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-accent/5"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}

                  {simulations.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma simulação disponível.
                      <br />
                      Importe uma simulação para começar.
                    </div>
                  )}

                  {isLoading && (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
                      <p className="mt-2 text-muted-foreground">
                        Carregando simulações...
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Executions */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-accent" />
                  Execuções Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {simulations.map(
                    (simulation) =>
                      simulation.lastExecution && (
                        <div
                          key={`${simulation.id}-last-execution`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
                        >
                          <div className="p-2 rounded-lg bg-accent/10">
                            <Gauge className="h-4 w-4 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {simulation.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                simulation.lastExecution.date
                              ).toLocaleString()}{" "}
                              • {simulation.configuration.users} usuários
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary"
                          >
                            {simulation.lastExecution.successRate}% sucesso
                          </Badge>
                        </div>
                      )
                  )}

                  {!simulations.some((s) => s.lastExecution) && !isLoading && (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhuma execução recente
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Metrics Overview */}
        <Card className="shadow-xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Métricas Gerais</CardTitle>
            <CardDescription>
              Visão geral das métricas de performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {simulations[0]?.lastExecution ? (
                <>
                  <div className="p-4 rounded-lg bg-background/50">
                    <p className="text-sm text-muted-foreground">
                      Tempo Médio de Resposta
                    </p>
                    <p className="text-2xl font-bold text-accent mt-1">
                      {simulations[0].lastExecution.avgResponseTime}ms
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50">
                    <p className="text-sm text-muted-foreground">
                      Taxa de Sucesso
                    </p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {simulations[0].lastExecution.successRate}%
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50">
                    <p className="text-sm text-muted-foreground">
                      Requisições/Segundo
                    </p>
                    <p className="text-2xl font-bold text-accent mt-1">
                      {simulations[0].lastExecution.requestsPerSecond}
                    </p>
                  </div>
                </>
              ) : (
                <div className="col-span-3 text-center py-4 text-muted-foreground">
                  Execute uma simulação para ver as métricas
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Gatling;
