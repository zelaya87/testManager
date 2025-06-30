"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileText } from "lucide-react";
import { KarateTest } from "@/types/karate-test";

interface TestSelectorProps {
  tests: KarateTest[];
  selectedTests: string[];
  onSelectionChange: (selectedTests: string[]) => void;
  onDataFileClick: (testId: string, dataFile: string) => void;
}

export default function TestSelector({
  tests,
  selectedTests,
  onSelectionChange,
  onDataFileClick,
}: TestSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...new Set(tests.map((test) => test.category))];

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectAll = () => {
    if (selectedTests.length === filteredTests.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredTests.map((test) => test.id));
    }
  };

  const handleTestSelect = (testId: string) => {
    if (selectedTests.includes(testId)) {
      onSelectionChange(selectedTests.filter((id) => id !== testId));
    } else {
      onSelectionChange([...selectedTests, testId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Testes Disponíveis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar testes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={
                selectedTests.length === filteredTests.length &&
                filteredTests.length > 0
              }
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm">Selecionar Todos</span>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="flex flex-col w-full bg-background/50 rounded-md p-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={selectedTests.includes(test.id)}
                        onCheckedChange={() => handleTestSelect(test.id)}
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-medium block truncate">
                          {test.name}
                        </span>
                        <span className="text-xs text-muted-foreground block truncate">
                          {test.path}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{test.category}</Badge>
                      {test.dataFiles && test.dataFiles.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onDataFileClick(test.id, test.dataFiles![0])
                          }
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
