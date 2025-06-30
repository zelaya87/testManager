"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestHistoryEntry {
  id: string;
  testName: string;
  category: string;
  status: string;
  type: string;
  environment: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  success?: boolean;
  errorLog?: string;
  reportPath?: string;
  metrics?: {
    [key: string]: any;
  };
}

interface TestHistoryProps {
  projectId?: string;
}

export default function TestHistory({ projectId }: TestHistoryProps) {
  const { data: session } = useSession();
  const [history, setHistory] = useState<TestHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadHistory();
    }
  }, [session, projectId]);

  const loadHistory = async () => {
    if (!session?.user) return;
    try {
      setLoading(true);
      let endpoint = "/api/test-history";

      if (projectId) {
        endpoint += `?projectId=${projectId}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Erro ao carregar histórico");
      }

      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const handleOpenReport = async (reportPath: string) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.openReport(reportPath);
      } else {
        window.open(reportPath, "_blank");
      }
    } catch (error) {
      console.error("Erro ao abrir relatório:", error);
    }
  };

  if (loading) {
    return <div>Carregando histórico...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Testes</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhum teste executado ainda.
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="mb-4 p-4 border rounded-lg hover:bg-accent/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{entry.testName}</h3>
                  <Badge
                    variant={
                      entry.status === "completed"
                        ? "success"
                        : entry.status === "error"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {entry.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Categoria: {entry.category}</p>
                  <p>Tipo: {entry.type}</p>
                  <p>Ambiente: {entry.environment}</p>
                  <p>Início: {formatDate(entry.startTime)}</p>
                  {entry.endTime && <p>Fim: {formatDate(entry.endTime)}</p>}
                  {entry.duration && (
                    <p>Duração: {formatDuration(entry.duration)}</p>
                  )}
                </div>
                {entry.errorLog && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded text-sm">
                    {entry.errorLog}
                  </div>
                )}
                {entry.reportPath && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => handleOpenReport(entry.reportPath!)}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Ver Relatório
                  </Button>
                )}
                {entry.metrics && Object.keys(entry.metrics).length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Métricas:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(entry.metrics).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span>{" "}
                          {typeof value === "number"
                            ? value.toFixed(2)
                            : String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
