import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/state/project.store';
import { ProjectCard } from '@/components/project/ProjectCard';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban, Loader2 } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/utils/toast-utils';

export function DashboardPage() {
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenProject = (projectId: string) => {
    showSuccessToast(`Opening project workspace...`);
    navigate(`/workspace/${projectId}`);
  };

  const handleNewProject = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Select a project to open the AI workspace
          </p>
        </div>
        <Button className="glow-primary" onClick={handleNewProject}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="panel p-12 text-center">
          <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Connect your first project to get started with DevOS
          </p>
          <Button className="glow-primary" onClick={handleNewProject}>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onOpen={() => handleOpenProject(project.id)}
            />
          ))}
        </div>
      )}
      
      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
