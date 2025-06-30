"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Folder, Search, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Project {
  id: string;
  name: string;
  path: string;
  description?: string;
  type: string;
  framework: string;
  features: Array<{
    id: string;
    name: string;
    path: string;
    category: string;
  }>;
  history?: Array<{
    startTime: Date;
    success: boolean;
  }>;
}

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

export default function ProjectManager() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      loadProjects();
    }
  }, [session]);

  const loadProjects = async () => {
    if (!session?.user) return;
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      toast.error("Erro ao carregar projetos");
    }
  };

  const handleSearch = async () => {
    if (!session?.user || !searchTerm.trim()) {
      await loadProjects();
      return;
    }
    try {
      const response = await fetch(`/api/projects/search?q=${searchTerm}`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      toast.error("Erro na busca");
    }
  };

  const handleCreateProject = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!session?.user) return;

      const result = await window.electronAPI.selectMavenProject();
      if (!result.success) {
        toast.error("Erro ao selecionar projeto");
        return;
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          path: result.projectRoot,
          description: values.description,
          type: "KARATE",
          framework: "KARATE",
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar projeto");
      }

      toast.success("Projeto criado com sucesso");
      setIsDialogOpen(false);
      form.reset();
      loadProjects();
    } catch (error) {
      toast.error("Erro ao criar projeto");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir projeto");
      }

      toast.success("Projeto excluído com sucesso");
      loadProjects();
    } catch (error) {
      toast.error("Erro ao excluir projeto");
    }
  };

  const getLastTestStatus = (project: Project) => {
    if (!project.history?.length) return null;
    const lastTest = project.history[0];
    return lastTest.success ? "Sucesso" : "Falha";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-1 max-w-md">
          <Input
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="secondary" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCreateProject)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Projeto</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Meu Projeto de Testes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descrição do projeto..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Criar Projeto
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:bg-accent/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {project.name}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedProject(project)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p className="truncate">{project.path}</p>
                {project.description && (
                  <p className="mt-1 truncate">{project.description}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">{project.type}</Badge>
                  {getLastTestStatus(project) && (
                    <Badge
                      variant={
                        getLastTestStatus(project) === "Sucesso"
                          ? "success"
                          : "destructive"
                      }
                    >
                      {getLastTestStatus(project)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
