"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { electronService } from "@/services/electronService";

interface DataFileViewerProps {
  testId: string;
  dataFile: string;
  onClose: () => void;
}

export default function DataFileViewer({
  testId,
  dataFile,
  onClose,
}: DataFileViewerProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    const loadContent = async () => {
      try {
        const fileContent = await electronService.readFileContent(dataFile);
        setContent(fileContent);
      } catch (error) {
        console.error("Erro ao ler arquivo:", error);
        setContent("Erro ao carregar o conteúdo do arquivo");
      }
    };

    loadContent();
  }, [dataFile]);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Arquivo de Dados</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px]">
          <pre className="text-sm font-mono p-4 whitespace-pre-wrap">
            {content}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
