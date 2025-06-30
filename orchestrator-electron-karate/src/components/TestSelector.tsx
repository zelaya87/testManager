import React, { useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Check,
  X,
  FileText,
  FolderOpen,
  File,
  Upload,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { electronService } from "@/services/electronService";

interface KarateTest {
  id: string;
  name: string;
  path: string;
  category: string;
  scenarios: string[];
  enabled: boolean;
  dataFiles?: string[];
  descriptionFiles?: string[];
}

interface TestSelectorProps {
  tests: KarateTest[];
  selectedTests: string[];
  onSelectionChange: (testIds: string[]) => void;
  isScanning: boolean;
  onDataFileView?: (testId: string, dataFile: string) => void;
  onRefresh?: () => void;
}

const TestSelector: React.FC<TestSelectorProps> = ({
  tests,
  selectedTests,
  onSelectionChange,
  isScanning,
  onDataFileView,
  onRefresh,
}) => {
  const categories = [...new Set(tests.map((test) => test.category))];
  const dataFileInputRef = useRef<{ [key: string]: HTMLInputElement }>({});
  const descFileInputRef = useRef<{ [key: string]: HTMLInputElement }>({});
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const handleTestToggle = (testId: string) => {
    const newSelection = selectedTests.includes(testId)
      ? selectedTests.filter((id) => id !== testId)
      : [...selectedTests, testId];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedTests.length === tests.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tests.map((test) => test.id));
    }
  };

  const handleCategoryToggle = (category: string) => {
    const categoryTests = tests.filter((test) => test.category === category);
    const categoryTestIds = categoryTests.map((test) => test.id);
    const allSelected = categoryTestIds.every((id) =>
      selectedTests.includes(id)
    );

    if (allSelected) {
      onSelectionChange(
        selectedTests.filter((id) => !categoryTestIds.includes(id))
      );
    } else {
      const newSelection = [...new Set([...selectedTests, ...categoryTestIds])];
      onSelectionChange(newSelection);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "clienteExistente":
        return "Cliente Existente";
      case "clientePotencial":
        return "Cliente Potencial";
      default:
        return category;
    }
  };

  const formatCSVContent = (content: string): string => {
    try {
      // Divide o conteúdo em linhas e remove linhas vazias
      const lines = content.split("\n").filter((line) => line.trim());

      // Para cada linha, divide por vírgula e limpa os espaços em branco
      const formattedLines = lines.map((line) =>
        line
          .split(",")
          .map((cell) => cell.trim())
          .join(",")
      );

      // Junta todas as linhas com quebra de linha
      return formattedLines.join("\n");
    } catch (error) {
      console.error("Erro ao formatar CSV:", error);
      return content;
    }
  };

  const handleFileUpload = async (
    testId: string,
    file: File,
    type: "data" | "description"
  ) => {
    try {
      const test = tests.find((t) => t.id === testId);
      if (!test) return;

      // Encontra o arquivo existente com a mesma extensão
      const existingFiles =
        type === "data" ? test.dataFiles : test.descriptionFiles;
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const existingFile = existingFiles?.find((f) =>
        f.toLowerCase().endsWith(`.${fileExtension}`)
      );

      let targetPath;
      if (existingFile) {
        // Se existe um arquivo com a mesma extensão, vamos usar seu nome
        targetPath = existingFile;
        console.log("📂 Atualizando arquivo existente:", existingFile);
      } else {
        // Se não encontrou, usa o nome original do arquivo que está sendo feito upload
        const scenarioPath = test.path.split("/karateTests")[0];
        const folderPath = type === "data" ? "data" : "description";
        targetPath = `${scenarioPath}/karateTests/${folderPath}/${file.name}`;
        console.log("📂 Criando novo arquivo:", targetPath);
      }

      // Lê o conteúdo do arquivo enviado
      const fileContent = await file.text();

      // Formata o conteúdo se for um arquivo CSV
      const isCSV = file.name.toLowerCase().endsWith(".csv");
      const formattedContent = isCSV
        ? formatCSVContent(fileContent)
        : fileContent;

      console.log("📂 Salvando arquivo em:", targetPath);
      console.log("📂 Conteúdo formatado:", formattedContent);

      if (existingFile) {
        // Se estamos atualizando um arquivo existente, vamos usar o caminho dele
        await electronService.saveCsvFile({
          path: existingFile,
          content: formattedContent,
        });
      } else {
        // Se é um novo arquivo, usamos o novo caminho
        await electronService.saveCsvFile({
          path: targetPath,
          content: formattedContent,
        });
      }

      // Força uma atualização imediata dos dados
      if (onRefresh) {
        await onRefresh();
      }

      toast.success(
        existingFile
          ? "Arquivo atualizado com sucesso!"
          : "Novo arquivo criado com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      toast.error("Erro ao enviar arquivo");
    }
  };

  const handleDownloadFile = async (filePath: string) => {
    try {
      await electronService.downloadFile(filePath);
      toast.success("Download iniciado");
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      toast.error("Erro ao baixar arquivo");
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    try {
      await electronService.deleteFile(filePath);
      toast.success("Arquivo excluído com sucesso");
      setFileToDelete(null);
      onRefresh?.();
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error);
      toast.error("Erro ao excluir arquivo");
    }
  };

  if (isScanning) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Escaneando arquivos .feature...</span>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between pb-4 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2 hover:bg-primary/5 transition-colors"
          >
            {selectedTests.length === tests.length ? (
              <>
                <X className="h-4 w-4 text-destructive" />
                Desmarcar Todos
              </>
            ) : (
              <>
                <Check className="h-4 w-4 text-primary" />
                Selecionar Todos
              </>
            )}
          </Button>
          <Badge
            variant="secondary"
            className="bg-primary/5 text-primary px-3 py-1"
          >
            {selectedTests.length} de {tests.length} selecionados
          </Badge>
        </div>

        {/* Tests by Category */}
        {categories.map((category) => {
          const categoryTests = tests.filter(
            (test) => test.category === category
          );
          const selectedInCategory = categoryTests.filter((test) =>
            selectedTests.includes(test.id)
          ).length;

          return (
            <div
              key={category}
              className="space-y-4 bg-card/50 rounded-lg p-4 border border-border/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={
                      selectedInCategory === categoryTests.length &&
                      categoryTests.length > 0
                    }
                    onCheckedChange={() => handleCategoryToggle(category)}
                    className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <h3 className="font-medium text-foreground">
                    {getCategoryDisplayName(category)}
                  </h3>
                </div>
                <Badge variant="outline" className="text-xs font-normal">
                  {selectedInCategory} / {categoryTests.length}
                </Badge>
              </div>

              <div className="space-y-3 pl-8">
                {categoryTests.map((test) => (
                  <div key={test.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTests.includes(test.id)}
                        onCheckedChange={() => handleTestToggle(test.id)}
                        className="mt-1 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-sm text-foreground">
                            {test.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                            {test.path.split("/").pop()}
                          </span>
                        </div>

                        {/* Data Files Section */}
                        {(test.dataFiles?.length > 0 ||
                          test.descriptionFiles?.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {/* Data Files */}
                            {test.dataFiles && test.dataFiles.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <FileText className="h-3 w-3" />
                                  Arquivos de Dados
                                </div>
                                {test.dataFiles.map((file) => (
                                  <div
                                    key={file}
                                    className="flex items-center gap-2 bg-background/50 rounded-md p-2 text-xs hover:bg-background/80 cursor-pointer transition-colors"
                                    onClick={() =>
                                      onDataFileView?.(test.id, file)
                                    }
                                  >
                                    <File className="h-3 w-3 text-primary" />
                                    <span className="flex-1 truncate">
                                      {file.split("/").pop()}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:bg-primary/5"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownloadFile(file);
                                        }}
                                      >
                                        <Download className="h-3 w-3 text-primary" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:bg-destructive/10"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFileToDelete(file);
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex items-center gap-2">
                                  <input
                                    type="file"
                                    accept=".csv,.json"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file)
                                        handleFileUpload(test.id, file, "data");
                                      e.target.value = "";
                                    }}
                                    ref={(el) => {
                                      if (el)
                                        dataFileInputRef.current[test.id] = el;
                                    }}
                                    className="hidden"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs hover:bg-primary/5"
                                    onClick={() =>
                                      dataFileInputRef.current[test.id]?.click()
                                    }
                                  >
                                    <Upload className="h-3 w-3 mr-2" />
                                    Adicionar Arquivo de Dados
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Description Files */}
                            {test.descriptionFiles &&
                              test.descriptionFiles.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <FileText className="h-3 w-3" />
                                    Arquivos de Descrição
                                  </div>
                                  {test.descriptionFiles.map((file) => (
                                    <div
                                      key={file}
                                      className="flex items-center gap-2 bg-background/50 rounded-md p-2 text-xs hover:bg-background/80 cursor-pointer transition-colors"
                                      onClick={() =>
                                        onDataFileView?.(test.id, file)
                                      }
                                    >
                                      <File className="h-3 w-3 text-accent" />
                                      <span className="flex-1 truncate">
                                        {file.split("/").pop()}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 hover:bg-accent/5"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadFile(file);
                                          }}
                                        >
                                          <Download className="h-3 w-3 text-accent" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 hover:bg-destructive/10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setFileToDelete(file);
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="file"
                                      accept=".csv,.json"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file)
                                          handleFileUpload(
                                            test.id,
                                            file,
                                            "description"
                                          );
                                        e.target.value = "";
                                      }}
                                      ref={(el) => {
                                        if (el)
                                          descFileInputRef.current[test.id] =
                                            el;
                                      }}
                                      className="hidden"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full text-xs hover:bg-accent/5"
                                      onClick={() =>
                                        descFileInputRef.current[
                                          test.id
                                        ]?.click()
                                      }
                                    >
                                      <Upload className="h-3 w-3 mr-2" />
                                      Adicionar Arquivo de Descrição
                                    </Button>
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                    {categoryTests.indexOf(test) < categoryTests.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog
        open={!!fileToDelete}
        onOpenChange={() => setFileToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o arquivo?
              <br />
              <span className="text-sm font-mono mt-2 block">
                {fileToDelete?.split("/").pop()}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => fileToDelete && handleDeleteFile(fileToDelete)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TestSelector;
