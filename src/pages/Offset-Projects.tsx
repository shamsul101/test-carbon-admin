/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useOffsetStore } from "@/store/offsetStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import ProjectDetailsDialog from "@/components/ProjectDetails";
import { useAuthStore } from "@/store/auth";
import ProjectCard from "@/components/offset/ProjectCard";
import ProjectFormDialog from "@/components/offset/ProjectFormDialog";

export interface Project {
  id: number;
  image_url: string;
  is_active: boolean;
  is_default: boolean;
  name: string;
  description: string;
  project_type?: string | null;
  location?: string | null;
  standard?: string | null;
  identification_number?: string;
  vintage?: string | null;
  info_link?: string | null;
  validation_report?: string | null;
  monitoring_report?: string | null;
  price_per_ton: string;
  allocated_amount: number;
  available_amount: number;
  currency: string;
  image: string;
  project_id_display?: string | null;
  registry?: string | null;
}

interface ProjectFormData {
  name: string;
  description: string;
  project_type: string;
  location: string;
  standard: string;
  identification_number: string;
  vintage: string;
  info_link: string;
  validation_report?: string | null;
  monitoring_report?: string | null;
  price_per_ton: string;
  allocated_amount: number;
  available_amount: number;
  currency: string;
  is_default: boolean;
  is_active?: boolean;
}

const initialFormData: ProjectFormData = {
  name: "",
  description: "",
  project_type: "",
  location: "",
  standard: "",
  identification_number: "",
  vintage: "",
  info_link: "",
  price_per_ton: "",
  allocated_amount: 0,
  available_amount: 0,
  currency: "USD",
  is_default: false,
  is_active: true,
};

export default function OffsetProjects() {
  const {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    showActiveOnly,
    setShowActiveOnly,
  } = useOffsetStore();

  const { accessToken } = useAuthStore();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] =
    useState<ProjectFormData>(initialFormData);
  const [editProject, setEditProject] =
    useState<ProjectFormData>(initialFormData);

  const [newProjectImage, setNewProjectImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editProjectImage, setEditProjectImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const [newValidationReportFile, setNewValidationReportFile] =
    useState<File | null>(null);
  const [newMonitoringReportFile, setNewMonitoringReportFile] =
    useState<File | null>(null);
  const [editValidationReportFile, setEditValidationReportFile] =
    useState<File | null>(null);
  const [editMonitoringReportFile, setEditMonitoringReportFile] =
    useState<File | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [visibleProjects, setVisibleProjects] = useState(6);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    setVisibleProjects(6);
  }, [projects.length]);

  useEffect(() => {
    if (newProjectImage) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(newProjectImage);
    } else {
      setImagePreview(null);
    }
  }, [newProjectImage]);

  useEffect(() => {
    if (editProjectImage) {
      const reader = new FileReader();
      reader.onloadend = () => setEditImagePreview(reader.result as string);
      reader.readAsDataURL(editProjectImage);
    } else {
      setEditImagePreview(null);
    }
  }, [editProjectImage]);

  const buildFormData = (
    project: Project | ProjectFormData,
    overrides?: {
      image?: File;
      validation_report?: File;
      monitoring_report?: File;
      is_active?: boolean;
      is_default?: boolean;
    }
  ) => {
    const formData = new FormData();

    formData.append("name", project.name);
    formData.append("description", project.description);
    formData.append("price_per_ton", project.price_per_ton);
    formData.append("allocated_amount", project.allocated_amount.toString());
    formData.append("available_amount", project.available_amount.toString());
    formData.append("currency", project.currency);
    formData.append(
      "is_active",
      String(overrides?.is_active ?? (project as Project).is_active ?? true)
    );
    formData.append(
      "is_default",
      String(overrides?.is_default ?? project.is_default)
    );

    if (project.project_type) {
      formData.append("project_type", project.project_type);
    }
    if (project.location) {
      formData.append("location", project.location);
    }
    if (project.standard) {
      formData.append("standard", project.standard);
    }
    if (project.identification_number) {
      formData.append("identification_number", project.identification_number);
    }
    if (project.vintage) {
      formData.append("vintage", project.vintage);
    }
    if (project.info_link) {
      formData.append("info_link", project.info_link);
    }
    // if (project.gold_standard_confirmation) {
    //   formData.append(
    //     "gold_standard_confirmation",
    //     project.gold_standard_confirmation
    //   );
    // }

    if (overrides?.image instanceof File) {
      formData.append("image", overrides.image);
    }

    if (overrides?.validation_report instanceof File) {
      formData.append("validation_report", overrides.validation_report);
    }

    if (overrides?.monitoring_report instanceof File) {
      formData.append("monitoring_report", overrides.monitoring_report);
    }

    return formData;
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;
    const formData = buildFormData(newProject, {
      image: newProjectImage || undefined,
      validation_report: newValidationReportFile || undefined,
      monitoring_report: newMonitoringReportFile || undefined,
    });

    const success = await createProject(formData, accessToken);
    if (success) {
      setNewProject(initialFormData);
      setNewProjectImage(null);
      setImagePreview(null);
      setNewValidationReportFile(null);
      setNewMonitoringReportFile(null);
      setCreateDialogOpen(false);
    }
  };

  const handleSaveEditProject = async () => {
    if (editProjectId === null) return;
    const formData = buildFormData(editProject, {
      image: editProjectImage || undefined,
      validation_report: editValidationReportFile || undefined,
      monitoring_report: editMonitoringReportFile || undefined,
    });

    const success = await updateProject(editProjectId, formData, accessToken);
    if (success) {
      setEditProjectId(null);
      setEditProjectImage(null);
      setEditImagePreview(null);
      setEditValidationReportFile(null);
      setEditMonitoringReportFile(null);
    }
  };

  const handleActivateProject = async (
    project: Project,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const formData = buildFormData(project, { is_active: true });
    await updateProject(project.id, formData, accessToken);
  };

  const handleDeactivateProject = async (
    project: Project,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const formData = buildFormData(project, { is_active: false });
    await updateProject(project.id, formData, accessToken);
  };

  const handleMakeDefault = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const formData = buildFormData(project, { is_default: true });
    await updateProject(project.id, formData, accessToken);
  };

  const handleRemoveDefault = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const formData = buildFormData(project, { is_default: false });
    await updateProject(project.id, formData, accessToken);
  };

  const openEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditProjectId(project.id);
    setEditProject({
      name: project.name,
      description: project.description,
      project_type: project.project_type || "",
      location: project.location || "",
      standard: project.standard || "",
      identification_number: project.identification_number || "",
      vintage: project.vintage || "",
      info_link: project.info_link || "",
      validation_report: project.validation_report || "",
      monitoring_report: project.monitoring_report || "",
      // gold_standard_confirmation: project.gold_standard_confirmation || "",
      price_per_ton: project.price_per_ton,
      allocated_amount: project.allocated_amount,
      available_amount: project.available_amount,
      currency: project.currency,
      is_default: project.is_default,
      is_active: project.is_active,
    });
    setEditProjectImage(null);
    setEditImagePreview(null);
    setEditValidationReportFile(null);
    setEditMonitoringReportFile(null);
  };

  const handleDeleteProject = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id, accessToken);
    }
  };

  const handleViewDetails = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
  };

  const loadMoreProjects = () => {
    setVisibleProjects((prev) => Math.min(prev + 6, projects.length));
  };

  const showLessProjects = () => {
    setVisibleProjects(6);
  };

  const displayedProjects = projects.slice(0, visibleProjects);
  const hasMoreProjects = visibleProjects < projects.length;
  const canShowLess = visibleProjects > 6;

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          Loading offset projects...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)] text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Offset Projects
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and showcase environmental offset projects. Showing{" "}
            {showActiveOnly ? "active" : "all"} {displayedProjects.length} of{" "}
            {projects.length} projects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-card">
            <Label htmlFor="active-toggle" className="text-sm cursor-pointer">
              {showActiveOnly ? "Active Only" : "All Projects"}
            </Label>
            <Switch
              id="active-toggle"
              checked={showActiveOnly}
              onCheckedChange={setShowActiveOnly}
            />
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-carbon-gradient hover:bg-carbon-600">
                <Plus className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {displayedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onViewDetails={handleViewDetails}
            onEdit={openEditProject}
            onDelete={handleDeleteProject}
            onActivate={handleActivateProject}
            onDeactivate={handleDeactivateProject}
            onMakeDefault={handleMakeDefault}
            onRemoveDefault={handleRemoveDefault}
            onCardClick={setSelectedProject}
            editProjectId={editProjectId}
          />
        ))}
        {displayedProjects.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No projects available.
          </div>
        )}
      </div>

      {(hasMoreProjects || canShowLess) && (
        <div className="flex justify-center mt-8 gap-4">
          {canShowLess && (
            <Button
              onClick={showLessProjects}
              disabled={loading}
              variant="outline"
              className="px-6 py-2 flex items-center gap-2"
            >
              <ArrowUp className="w-4 h-4" />
              Show Less
            </Button>
          )}
          {hasMoreProjects && (
            <Button
              onClick={loadMoreProjects}
              disabled={loading}
              className="bg-carbon-gradient hover:bg-carbon-600 px-6 py-2 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More Projects
                  <ArrowDown className="w-4 h-4" />
                  <span className="ml-1 text-xs opacity-80">
                    ({projects.length - visibleProjects} more)
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
      )}

      <ProjectDetailsDialog
        project={selectedProject as any}
        open={!!selectedProject}
        onOpenChange={() => setSelectedProject(null)}
      />

      <ProjectFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Create New Project"
        description="Add a new environmental offset project."
        formData={newProject}
        onFormDataChange={setNewProject}
        imagePreview={imagePreview}
        onImageUpload={(e) => setNewProjectImage(e.target.files?.[0] || null)}
        onImageClear={() => {
          setNewProjectImage(null);
          setImagePreview(null);
        }}
        validationReportFile={newValidationReportFile}
        monitoringReportFile={newMonitoringReportFile}
        onValidationReportUpload={(e) =>
          setNewValidationReportFile(e.target.files?.[0] || null)
        }
        onMonitoringReportUpload={(e) =>
          setNewMonitoringReportFile(e.target.files?.[0] || null)
        }
        onValidationReportClear={() => setNewValidationReportFile(null)}
        onMonitoringReportClear={() => setNewMonitoringReportFile(null)}
        onSubmit={handleCreateProject}
        loading={loading}
        submitLabel="Create Project"
      />

      {editProjectId !== null && (
        <ProjectFormDialog
          open={editProjectId !== null}
          onOpenChange={(open) => !open && setEditProjectId(null)}
          title="Edit Project"
          description="Update offset project details."
          formData={editProject}
          onFormDataChange={setEditProject}
          imagePreview={editImagePreview}
          onImageUpload={(e) =>
            setEditProjectImage(e.target.files?.[0] || null)
          }
          onImageClear={() => {
            setEditProjectImage(null);
            setEditImagePreview(null);
          }}
          validationReportFile={editValidationReportFile}
          monitoringReportFile={editMonitoringReportFile}
          onValidationReportUpload={(e) =>
            setEditValidationReportFile(e.target.files?.[0] || null)
          }
          onMonitoringReportUpload={(e) =>
            setEditMonitoringReportFile(e.target.files?.[0] || null)
          }
          onValidationReportClear={() => setEditValidationReportFile(null)}
          onMonitoringReportClear={() => setEditMonitoringReportFile(null)}
          onSubmit={handleSaveEditProject}
          loading={loading}
          submitLabel="Save Changes"
          currentImageUrl={
            projects.find((p) => p.id === editProjectId)?.image_url
          }
          currentValidationReport={editProject.validation_report || undefined}
          currentMonitoringReport={editProject.monitoring_report || undefined}
        />
      )}
    </div>
  );
}
