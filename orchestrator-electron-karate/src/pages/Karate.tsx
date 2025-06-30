import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TestSelector from "@/components/TestSelector";
import TestExecutor from "@/components/TestExecutor";
import DataFileViewer from "@/components/DataFileViewer";
import { FolderOpen, Play, Settings, Zap, ArrowLeft } from "lucide-react";
import { electronService } from "@/services/electronService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { KarateTest } from "@/types/KarateTest";

const Karate = () => {
  const navigate = useNavigate();
  const [projectPath, setProjectPath] = useState<string>("");
  const [discoveredTests, setDiscoveredTests] = useState<KarateTest[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFileViewer, setDataFileViewer] = useState({
    isOpen: false,
    testId: "",
    dataFile: "",
  });

  const isElectronMode = electronService.isElectronMode;

  useEffect(() => {
    if (isElectronMode) {
      handleLoadTests();
    }
  }, [isElectronMode]);

  const handleLoadTests = async () => {
    setIsLoading(true);
    try {
      if (isElectronMode) {
        const projectResult = await electronService.selectMavenProject();
        if (!projectResult.success) {
          throw new Error(projectResult.error);
        }
        setProjectPath(projectResult.projectRoot || "");
      }

      await refreshTests();
    } catch (error) {
      console.error("Erro ao carregar cenários:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar cenários"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTests = async () => {
    try {
      const testResults = await electronService.getFeatureTests();
      const convertedTests: KarateTest[] = Object.entries(testResults).flatMap(
        ([category, tests]) =>
          tests.map((test, index) => ({
            id: `${category}-${index}`,
            name: `${test.scenarioName}`,
            path: test.feature,
            category: test.category,
            enabled: true,
            dataFiles: test.dataFiles,
            descriptionFiles: test.descriptionFiles,
            scenarios: [],
          }))
      );

      setDiscoveredTests(convertedTests);
      toast.success(`${convertedTests.length} cenários encontrados`);
    } catch (error) {
      console.error("Erro ao atualizar cenários:", error);
      toast.error("Erro ao atualizar lista de cenários");
    }
  };

  const handleTestSelection = (testIds: string[]) => {
    setSelectedTests(testIds);
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
                className="hover:bg-primary/5"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5 text-primary" />
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Karate Tests
              </h1>
            </div>
            {projectPath && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" />
                <span>Projeto: {projectPath}</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleLoadTests}
            variant="default"
            size="lg"
            className="bg-primary/90 hover:bg-primary shadow-lg transition-all duration-200 ease-in-out"
            disabled={isLoading}
          >
            <FolderOpen className="h-5 w-5 mr-2" />
            {isLoading ? "Carregando..." : "Carregar Testes"}
          </Button>
        </div>

        {discoveredTests.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="shadow-xl border border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Cenários Disponíveis
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary font-medium px-3 py-1"
                    >
                      {selectedTests.length} selecionados
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <TestSelector
                    tests={discoveredTests}
                    selectedTests={selectedTests}
                    onSelectionChange={handleTestSelection}
                    isScanning={isLoading}
                    onDataFileView={(testId, dataFile) =>
                      setDataFileViewer({ isOpen: true, testId, dataFile })
                    }
                    onRefresh={refreshTests}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="shadow-xl border border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-accent" />
                    Execução
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <TestExecutor
                    selectedTests={selectedTests}
                    tests={discoveredTests}
                    isElectronMode={isElectronMode}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <DataFileViewer
          isOpen={dataFileViewer.isOpen}
          onClose={() =>
            setDataFileViewer({ isOpen: false, testId: "", dataFile: "" })
          }
          testId={dataFileViewer.testId}
          dataFile={dataFileViewer.dataFile}
        />
      </div>
    </div>
  );
};

export default Karate;
