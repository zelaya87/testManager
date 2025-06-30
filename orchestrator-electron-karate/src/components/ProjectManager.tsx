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
import { projectService } from "@/services/projectService";

interface Project {
  id: string;
  name: string;
  path: string;
  description?: string;
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

export default function ProjectManager() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadProjects();
    }
  }, [session]);

  const loadProjects = async () => {
    if (!session?.user) return;
    const data = await projectService.getUserProjects(session.user.id);
    setProjects(data);
  };

  const handleSearch = async () => {
    if (!session?.user || !searchTerm.trim()) {
      await loadProjects();
      return;
    }
    const results = await projectService.searchProjects(
      session.user.id,
      searchTerm
    );
    setProjects(results);
  };

  const handleCreateProject = async (formData: any) => {
    try {
      if (!session?.user) return;

      const result = await window.electronAPI.selectMavenProject();
      if (!result.success) {
        toast.error("Erro ao selecionar projeto");
        return;
      }

      await projectService.createProject({
        userId: session.user.id,
        name: formData.name,
        path: result.projectRoot,
        description: formData.description,
      });

      toast.success("Projeto criado com sucesso");
      setIsDialogOpen(false);
      loadProjects();
    } catch (error) {
      toast.error("Erro ao criar projeto");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId);
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
            <Form onSubmit={handleCreateProject} className="space-y-4">
              <FormField
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
                  <p className="mt-1">{project.description}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span>{project.features.length} features</span>
                </div>
                {getLastTestStatus(project) && (
                  <p className="mt-1">
                    Último teste: {getLastTestStatus(project)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
