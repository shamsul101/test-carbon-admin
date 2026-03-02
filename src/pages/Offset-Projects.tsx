import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOffsetStore } from "@/store/offsetStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  Globe,
  ArrowRight,
  Eye,
  X,
  Star,
  Ban,
  Play,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import ProjectDetailsDialog from "@/components/ProjectDetails";
import { useAuthStore } from "@/store/auth";

interface Project {
  id: number;
  image_url: string;
  is_active: boolean;
  is_default: boolean;
  name: string;
  description: string;
  gold_standard_confirmation: string;
  price_per_ton: string;
  allocated_amount: number;
  available_amount: number;
  currency: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  gold_standard_confirmation: string;
  price_per_ton: string;
  allocated_amount: number;
  available_amount: number;
  currency: string;
  image?: File;
  is_default: boolean;
  is_active?: boolean;
}

export default function OffsetProjects() {
  const {
    projects,
    loading,
    error,
    currentPage,
    itemsPerPage,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    loadMoreProjects,
    showLessProjects,
  } = useOffsetStore();

  const { accessToken } = useAuthStore();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<ProjectFormData>({
    name: "",
    description: "",
    gold_standard_confirmation: "",
    price_per_ton: "",
    allocated_amount: 0,
    available_amount: 0,
    currency: "USD",
    is_default: false,
    is_active: true,
  });
  const [newProjectImage, setNewProjectImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [editProject, setEditProject] = useState<ProjectFormData>(newProject);
  const [editProjectImage, setEditProjectImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // FormData
  const buildFormData = (
    project: Project | ProjectFormData,
    overrides?: Partial<ProjectFormData>
  ) => {
    const formData = new FormData();
    formData.append("name", project.name);
    formData.append("description", project.description);
    formData.append(
      "gold_standard_confirmation",
      project.gold_standard_confirmation
    );
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

    if (overrides?.image instanceof File) {
      formData.append("image", overrides.image);
    }
    return formData;
  };

  // image preview for new project
  useEffect(() => {
    if (newProjectImage) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(newProjectImage);
    } else {
      setImagePreview(null);
    }
  }, [newProjectImage]);

  // image preview
  useEffect(() => {
    if (editProjectImage) {
      const reader = new FileReader();
      reader.onloadend = () => setEditImagePreview(reader.result as string);
      reader.readAsDataURL(editProjectImage);
    } else {
      setEditImagePreview(null);
    }
  }, [editProjectImage]);

  // displayed projects
  const displayedProjects = projects.slice(0, currentPage * itemsPerPage);
  const hasMoreProjects = displayedProjects.length < projects.length;
  const canShowLess = currentPage > 1;

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;
    const formData = buildFormData(newProject, {
      image: newProjectImage || undefined,
    });
    const success = await createProject(formData, accessToken);
    if (success) {
      setNewProject({
        name: "",
        description: "",
        gold_standard_confirmation: "",
        price_per_ton: "",
        allocated_amount: 0,
        available_amount: 0,
        currency: "USD",
        is_default: false,
        is_active: true,
      });
      setNewProjectImage(null);
      setImagePreview(null);
      setCreateDialogOpen(false);
    }
  };

  const handleSaveEditProject = async () => {
    if (editProjectId === null) return;
    const formData = buildFormData(editProject, {
      image: editProjectImage || undefined,
    });
    const success = await updateProject(editProjectId, formData, accessToken);
    if (success) {
      setEditProjectId(null);
      setEditProjectImage(null);
      setEditImagePreview(null);
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
      gold_standard_confirmation: project.gold_standard_confirmation,
      price_per_ton: project.price_per_ton,
      allocated_amount: project.allocated_amount,
      available_amount: project.available_amount,
      currency: project.currency,
      is_default: project.is_default,
      is_active: project.is_active,
    });
    setEditProjectImage(null);
    setEditImagePreview(null);
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

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean = false
  ) => {
    const file = e.target.files?.[0] || null;
    if (isEdit) {
      setEditProjectImage(file);
    } else {
      setNewProjectImage(file);
    }
  };

  const clearImage = (isEdit: boolean = false) => {
    if (isEdit) {
      setEditProjectImage(null);
      setEditImagePreview(null);
    } else {
      setNewProjectImage(null);
      setImagePreview(null);
    }
  };

  // Status badge component
  const StatusBadge = ({
    isActive,
    isDefault,
  }: {
    isActive: boolean;
    isDefault: boolean;
  }) => (
    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
      {!isActive && (
        <div className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
          Deactivated
        </div>
      )}
      {isDefault && (
        <div className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold">
          Default
        </div>
      )}
    </div>
  );

  // Action buttons component
  const ActionButtons = ({ project }: { project: Project }) => (
    <div className="flex flex-wrap gap-2 mt-3">
      <Button
        size="sm"
        variant="outline"
        className="text-blue-700 hover:bg-blue-50 flex-1"
        onClick={(e) => handleViewDetails(project, e)}
        title="View project details"
      >
        <Eye className="w-4 h-4 mr-1" /> Details
      </Button>
      <Dialog
        open={editProjectId === project.id}
        onOpenChange={(open) => !open && setEditProjectId(null)}
      >
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="text-green-700 hover:bg-green-50 flex-1"
            onClick={(e) => openEditProject(project, e)}
            title="Edit project"
          >
            <Edit className="w-4 h-4 mr-1" /> Edit
          </Button>
        </DialogTrigger>
      </Dialog>
      <Button
        size="sm"
        variant="outline"
        className="text-red-700 hover:bg-red-50 flex-1"
        onClick={(e) => handleDeleteProject(project.id, e)}
        title="Delete project"
      >
        <Trash2 className="w-4 h-4 mr-1" /> Delete
      </Button>
      {project.is_active ? (
        <Button
          size="sm"
          variant="outline"
          className="text-red-700 hover:bg-red-50 border-red-300 flex-1"
          onClick={(e) => handleDeactivateProject(project, e)}
          title="Deactivate project"
        >
          <Ban className="w-4 h-4 mr-1" /> Deactivate
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="text-green-700 hover:bg-green-50 border-green-300 flex-1"
          onClick={(e) => handleActivateProject(project, e)}
          title="Activate project"
        >
          <Play className="w-4 h-4 mr-1" /> Activate
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        className={`flex-1 ${
          project.is_default
            ? "text-amber-700 hover:bg-amber-50 border-amber-300"
            : "text-amber-700 hover:bg-amber-50 border-amber-300"
        }`}
        onClick={(e) =>
          project.is_default
            ? handleRemoveDefault(project, e)
            : handleMakeDefault(project, e)
        }
        title={
          project.is_default
            ? "Remove default status"
            : "Set as default project"
        }
      >
        <Star
          className={`w-4 h-4 mr-1 ${
            project.is_default ? "fill-amber-400" : ""
          }`}
        />
        {project.is_default ? "Remove Default" : "Make Default"}
      </Button>
    </div>
  );

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading offset projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Offset Projects
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and showcase environmental offset projects. Add, edit, delete
            or view details.
          </p>
        </div>
        {/* Create Project Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-carbon-gradient hover:bg-carbon-600">
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-background border max-h-[90vh] overflow-y-auto">
            <DialogHeader className="text-center">
              <DialogTitle>Add Offset Project</DialogTitle>
              <DialogDescription>
                Register a new environmental offset project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 p-4 px-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="e.g., Amazon Rainforest Restoration"
                />
              </div>
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="project-image">Project Image</Label>
                <Input
                  id="project-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e)}
                />
                {imagePreview && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => clearImage()}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Project description..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-price">Price per Ton</Label>
                  <Input
                    id="project-price"
                    type="number"
                    step="0.01"
                    value={newProject.price_per_ton}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        price_per_ton: e.target.value,
                      })
                    }
                    placeholder="e.g., 10.50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-currency">Currency</Label>
                  <Input
                    id="project-currency"
                    value={newProject.currency}
                    onChange={(e) =>
                      setNewProject({ ...newProject, currency: e.target.value })
                    }
                    placeholder="e.g., USD"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-allocated">Allocated Amount</Label>
                  <Input
                    id="project-allocated"
                    type="number"
                    value={newProject.allocated_amount}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        allocated_amount: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="e.g., 2000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-available">Available Amount</Label>
                  <Input
                    id="project-available"
                    type="number"
                    value={newProject.available_amount}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        available_amount: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="e.g., 0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-gold-standard">
                  Standard Confirmation
                </Label>
                <Input
                  id="project-gold-standard"
                  value={newProject.gold_standard_confirmation}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      gold_standard_confirmation: e.target.value,
                    })
                  }
                  placeholder="Gold standard certified"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={newProject.is_default}
                  onCheckedChange={() =>
                    setNewProject({
                      ...newProject,
                      is_default: !newProject.is_default,
                    })
                  }
                  id="project-default"
                />
                <Label htmlFor="project-default">
                  {newProject.is_default ? "Default" : "Not Default"}
                </Label>
              </div>
            </div>
            <div className="flex justify-center px-4 pb-4">
              <Button
                onClick={handleCreateProject}
                disabled={loading}
                className="bg-carbon-gradient w-full"
              >
                {loading ? "Creating..." : "Add Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards - Responsive grid with 3 columns for large screens */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {displayedProjects.map((project) => (
          <Card
            key={project.id}
            className="flex flex-col transition-shadow ring-offset-2 ring-carbon-200 hover:ring-2 cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            <div className="h-48 sm:h-52 w-full relative rounded-t overflow-hidden flex-shrink-0">
              <img
                src={project.image_url || "/placeholder-project.jpg"}
                alt={project.name}
                className="object-cover w-full h-full"
                loading="lazy"
              />
              <StatusBadge
                isActive={project.is_active}
                isDefault={project.is_default}
              />
            </div>
            <CardContent className="flex flex-col flex-1 pt-3 pb-4">
              <div className="font-bold text-lg mb-1">{project.name}</div>
              <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {project.description}
              </div>
              <div className="text-xs text-muted-foreground mt-auto mb-3">
                <div className="font-semibold">
                  ${project.price_per_ton} {project.currency}/ton
                </div>
                <div>Available: {project.available_amount} tons</div>
              </div>

              <ActionButtons project={project} />
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No projects available.
          </div>
        )}
      </div>

      {/* Load More / See Less Button */}
      {projects.length >= 6 && (hasMoreProjects || canShowLess) && (
        <div className="flex justify-center">
          <motion.button
            onClick={hasMoreProjects ? loadMoreProjects : showLessProjects}
            disabled={loading}
            className="mt-12 px-8 py-3 bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary/50 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Loading...
              </>
            ) : hasMoreProjects ? (
              <>
                Load More Projects
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                See Less Projects
                <ArrowRight className="w-5 h-5 rotate-180" />
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={() => setSelectedProject(null)}
      />

      {/* Edit Project Dialog */}
      {editProjectId !== null && (
        <Dialog
          open={editProjectId !== null}
          onOpenChange={(open) => !open && setEditProjectId(null)}
        >
          <DialogContent className="sm:max-w-[600px] bg-background border max-h-[90vh] overflow-y-auto">
            <DialogHeader className="text-center">
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update offset project details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 p-4 px-4">
              <div className="space-y-2">
                <Label htmlFor="edit-project-name">Project Name</Label>
                <Input
                  id="edit-project-name"
                  value={editProject.name}
                  onChange={(e) =>
                    setEditProject({
                      ...editProject,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* Image Upload with Preview for Edit */}
              <div className="space-y-2">
                <Label htmlFor="edit-project-image">Project Image</Label>
                <Input
                  id="edit-project-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                />
                <div className="text-sm text-muted-foreground">
                  Current image will be replaced if you upload a new one.
                </div>
                {editImagePreview && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border">
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => clearImage(true)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {!editImagePreview &&
                  projects.find((p) => p.id === editProjectId)?.image_url && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border">
                      <img
                        src={
                          projects.find((p) => p.id === editProjectId)
                            ?.image_url || ""
                        }
                        alt="Current image"
                        className="w-full h-full object-cover"
                      />
                      <div className="text-xs text-center text-muted-foreground mt-1">
                        Current Image
                      </div>
                    </div>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-project-description">Description</Label>
                <Textarea
                  id="edit-project-description"
                  value={editProject.description}
                  onChange={(e) =>
                    setEditProject({
                      ...editProject,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-project-price">Price per Ton</Label>
                  <Input
                    id="edit-project-price"
                    type="number"
                    step="0.01"
                    value={editProject.price_per_ton}
                    onChange={(e) =>
                      setEditProject({
                        ...editProject,
                        price_per_ton: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-project-currency">Currency</Label>
                  <Input
                    id="edit-project-currency"
                    value={editProject.currency}
                    onChange={(e) =>
                      setEditProject({
                        ...editProject,
                        currency: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-project-allocated">
                    Allocated Amount
                  </Label>
                  <Input
                    id="edit-project-allocated"
                    type="number"
                    value={editProject.allocated_amount}
                    onChange={(e) =>
                      setEditProject({
                        ...editProject,
                        allocated_amount: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-project-available">
                    Available Amount
                  </Label>
                  <Input
                    id="edit-project-available"
                    type="number"
                    value={editProject.available_amount}
                    onChange={(e) =>
                      setEditProject({
                        ...editProject,
                        available_amount: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-project-gold-standard">
                  Gold Standard
                </Label>
                <Input
                  id="edit-project-gold-standard"
                  value={editProject.gold_standard_confirmation}
                  onChange={(e) =>
                    setEditProject({
                      ...editProject,
                      gold_standard_confirmation: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={editProject.is_default}
                  onCheckedChange={() =>
                    setEditProject({
                      ...editProject,
                      is_default: !editProject.is_default,
                    })
                  }
                  id="edit-project-default"
                />
                <Label htmlFor="edit-project-default">
                  {editProject.is_default ? "Default" : "Not Default"}
                </Label>
              </div>
            </div>
            <div className="flex justify-center px-4 pb-4 gap-2">
              <Button
                onClick={handleSaveEditProject}
                disabled={loading}
                className="bg-carbon-gradient w-full"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}