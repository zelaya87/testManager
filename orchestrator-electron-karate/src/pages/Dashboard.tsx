import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Gauge, Brain, Settings, LogOut } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 dark:from-background dark:to-background/90">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Test Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Selecione a ferramenta ou visualize insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-primary/5"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-destructive/5"
            >
              <LogOut className="h-5 w-5 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Karate Tests */}
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <PlayCircle className="h-6 w-6 text-primary" />
                </div>
                Karate Tests
              </CardTitle>
              <CardDescription>
                Execute e gerencie testes funcionais com Karate Framework
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex-1">Testes Disponíveis</span>
                  <span className="font-medium text-foreground">24</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex-1">Última Execução</span>
                  <span className="font-medium text-foreground">2h atrás</span>
                </div>
              </div>
              <Button
                className="w-full bg-primary/90 hover:bg-primary"
                onClick={() => navigate("/karate")}
              >
                Acessar Testes Karate
              </Button>
            </CardContent>
          </Card>

          {/* Gatling Tests */}
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Gauge className="h-6 w-6 text-accent" />
                </div>
                Gatling Tests
              </CardTitle>
              <CardDescription>
                Execute e monitore testes de performance com Gatling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex-1">Cenários Disponíveis</span>
                  <span className="font-medium text-foreground">8</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex-1">Última Execução</span>
                  <span className="font-medium text-foreground">1d atrás</span>
                </div>
              </div>
              <Button
                className="w-full bg-accent/90 hover:bg-accent"
                onClick={() => navigate("/gatling")}
              >
                Acessar Testes Gatling
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                AI Insights
              </CardTitle>
              <CardDescription>
                Análise detalhada e insights baseados em IA de todas as
                execuções
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex-1">Novos Insights</span>
                  <span className="font-medium text-foreground">5</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex-1">Última Análise</span>
                  <span className="font-medium text-foreground">
                    30min atrás
                  </span>
                </div>
              </div>
              <Button
                className="w-full bg-primary/90 hover:bg-primary"
                onClick={() => navigate("/insights")}
              >
                Ver Insights
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6 border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  type: "karate",
                  name: "Suite de Testes API",
                  status: "success",
                  time: "2h atrás",
                },
                {
                  type: "gatling",
                  name: "Teste de Carga - Produção",
                  status: "failed",
                  time: "1d atrás",
                },
                {
                  type: "karate",
                  name: "Testes de Integração",
                  status: "success",
                  time: "2d atrás",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === "karate"
                        ? "bg-primary/10"
                        : "bg-accent/10"
                    }`}
                  >
                    {activity.type === "karate" ? (
                      <PlayCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <Gauge className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs ${
                      activity.status === "success"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {activity.status === "success" ? "Sucesso" : "Falha"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
