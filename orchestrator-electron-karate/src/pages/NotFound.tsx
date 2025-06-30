import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-background/80 dark:from-background dark:to-background/90">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-medium text-foreground">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou foi removida.
          </p>
        </div>
        <Button
          onClick={() => navigate("/")}
          className="bg-primary/90 hover:bg-primary"
        >
          <Home className="h-4 w-4 mr-2" />
          Voltar para o início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
