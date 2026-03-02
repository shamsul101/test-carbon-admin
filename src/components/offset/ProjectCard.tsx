import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Star, Ban, Play } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface Project {
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

interface ProjectCardProps {
  project: Project;
  onViewDetails: (project: Project, e: React.MouseEvent) => void;
  onEdit: (project: Project, e: React.MouseEvent) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
  onActivate: (project: Project, e: React.MouseEvent) => void;
  onDeactivate: (project: Project, e: React.MouseEvent) => void;
  onMakeDefault: (project: Project, e: React.MouseEvent) => void;
  onRemoveDefault: (project: Project, e: React.MouseEvent) => void;
  onCardClick: (project: Project) => void;
  editProjectId: number | null;
}

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

export default function ProjectCard({
  project,
  onViewDetails,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onMakeDefault,
  onRemoveDefault,
  onCardClick,
  editProjectId,
}: ProjectCardProps) {
  // fnc to safely render HTML content from the rich text editor
  const renderDescription = () => {
    if (!project.description) return null;

    const hasHtmlTags = /<[^>]+>/.test(project.description);

    if (hasHtmlTags) {
      return (
        <div
          className="prose prose-sm max-w-none line-clamp-3"
          dangerouslySetInnerHTML={{ __html: project.description }}
        />
      );
    } else {
      const formattedText = project.description
        .split("\\n")
        .filter((line) => line.trim())
        .map((line, index) => {
          const trimmedLine = line.trim();

          if (trimmedLine.startsWith("•")) {
            return (
              <div key={index} className="flex gap-2 mb-3">
                <span className="text-lg leading-relaxed">•</span>
                <span className="flex-1 leading-relaxed">
                  {trimmedLine.substring(1).trim()}
                </span>
              </div>
            );
          }

          const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
          if (numberedMatch) {
            const [, number, content] = numberedMatch;
            return (
              <div key={index} className="flex gap-2 mb-3">
                <span className="font-semibold leading-relaxed">{number}.</span>
                <span className="flex-1 leading-relaxed">{content}</span>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={index} className="mb-3 leading-relaxed">
              {trimmedLine}
            </p>
          );
        });

      return <div className="space-y-1 line-clamp-3">{formattedText}</div>;
    }
  };
  return (
    <Card
      className="flex flex-col transition-shadow ring-offset-2 ring-carbon-200 hover:ring-2 cursor-pointer"
      onClick={() => onCardClick(project)}
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
          {renderDescription()}
        </div>
        <div className="text-md text-muted-foreground mt-auto">
          <div className="font-semibold">
            ${project.price_per_ton} {project.currency}/ton
          </div>
          {/* <div>Available: {project.available_amount} tons</div> */}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="text-blue-700 hover:bg-blue-50 flex-1"
            onClick={(e) => onViewDetails(project, e)}
            title="View project details"
          >
            <Eye className="w-4 h-4 mr-1" /> Details
          </Button>
          <Dialog open={editProjectId === project.id} onOpenChange={() => {}}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-green-700 hover:bg-green-50 flex-1"
                onClick={(e) => onEdit(project, e)}
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
            onClick={(e) => onDelete(project.id, e)}
            title="Delete project"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
          {project.is_active ? (
            <Button
              size="sm"
              variant="outline"
              className="text-red-700 hover:bg-red-50 border-red-300 flex-1"
              onClick={(e) => onDeactivate(project, e)}
              title="Deactivate project"
            >
              <Ban className="w-4 h-4 mr-1" /> Deactivate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-green-700 hover:bg-green-50 border-green-300 flex-1"
              onClick={(e) => onActivate(project, e)}
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
                ? onRemoveDefault(project, e)
                : onMakeDefault(project, e)
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
      </CardContent>
    </Card>
  );
}
