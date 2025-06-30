"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { electronService } from "@/services/electronService";
import TestSelector from "@/components/test-selector";
import TestExecutor from "@/components/test-executor";
import DataFileViewer from "@/components/data-file-viewer";
import { KarateTest } from "@/types/karate-test";

export default function KaratePage() {
  const [projectPath, setProjectPath] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [discoveredTests, setDiscoveredTests] = useState<KarateTest[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFileViewer, setDataFileViewer] = useState({
    isOpen: false,
    testId: "",
    dataFile: "",
  });

  const isElectronMode = electronService.isElectronMode;

  const handleLoadTests = async () => {
    setIsLoading(true);
    try {
      const result = await electronService.selectMavenProject();
      if (result.success && result.projectRoot) {
        setProjectPath(result.projectRoot);
        setProjectId(result.projectRoot);

        const tests = await electronService.getFeatureTests();
        setDiscoveredTests(tests);
        toast.success("Projeto carregado com sucesso");
      } else {
        toast.error("Erro ao carregar projeto");
      }
    } catch (error) {
      console.error("Erro ao carregar testes:", error);
      toast.error("Erro ao carregar testes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Karate Tests</h2>
        <p className="text-muted-foreground">
          Execute e gerencie seus testes Karate
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleLoadTests}
              disabled={isLoading || !isElectronMode}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Selecionar Projeto Maven
            </Button>
            {projectPath && (
              <p className="text-sm text-muted-foreground">{projectPath}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {discoveredTests.length > 0 && (
        <>
          <TestSelector
            tests={discoveredTests}
            selectedTests={selectedTests}
            onSelectionChange={setSelectedTests}
            onDataFileClick={(testId, dataFile) =>
              setDataFileViewer({ isOpen: true, testId, dataFile })
            }
          />

          <TestExecutor
            selectedTests={selectedTests}
            tests={discoveredTests}
            isElectronMode={isElectronMode}
            projectId={projectId}
          />

          {dataFileViewer.isOpen && (
            <DataFileViewer
              testId={dataFileViewer.testId}
              dataFile={dataFileViewer.dataFile}
              onClose={() =>
                setDataFileViewer({ isOpen: false, testId: "", dataFile: "" })
              }
            />
          )}
        </>
      )}
    </div>
  );
}
