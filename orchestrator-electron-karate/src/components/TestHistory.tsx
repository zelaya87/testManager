import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { testHistoryService } from "@/services/testHistoryService";

interface TestHistoryEntry {
  id: string;
  testName: string;
  category: string;
  status: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  success?: boolean;
  errorLog?: string;
  reportPath?: string;
}

export default function TestHistory() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<TestHistoryEntry[]>([]);

  useEffect(() => {
    if (session?.user) {
      loadHistory();
    }
  }, [session]);

  const loadHistory = async () => {
    if (!session?.user) return;
    const data = await testHistoryService.getTestHistory(session.user.id);
    setHistory(data);
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Testes</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="mb-4 p-4 border rounded-lg hover:bg-accent/5"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{entry.testName}</h3>
                <Badge variant={entry.success ? "success" : "destructive"}>
                  {entry.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Categoria: {entry.category}</p>
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
                <a
                  href={entry.reportPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Ver Relatório
                </a>
              )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
