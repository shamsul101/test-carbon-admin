import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Globe } from "lucide-react";

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

interface ProjectDetailsDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectDetailsDialog({
  project,
  open,
  onOpenChange,
}: ProjectDetailsDialogProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full bg-background border overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {project.name}
          </DialogTitle>
          <DialogDescription className="mt-2 text-base">
            <div className="flex flex-wrap gap-4 items-center text-base">
              <span className="flex items-center gap-1">
                <Globe className="w-5 h-5" /> <b>Status:</b>{" "}
                {project.is_active ? "Active" : "Inactive"}
              </span>
              {project.is_default && (
                <span className="flex items-center gap-1">
                  <b>Default Project</b>
                </span>
              )}
              <span className="flex items-center gap-1">
                <b>Price:</b> ${project.price_per_ton} {project.currency}/ton
              </span>
              <span className="flex items-center gap-1">
                <b>Available:</b> {project.available_amount} tons
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-8 mt-4">
          <img
            src={project.image_url || "/placeholder-project.jpg"}
            alt={project.name}
            className="object-cover rounded w-full md:w-96 h-56 md:h-96 border"
          />
          <div className="flex-1 space-y-4">
            <div>
              <span className="font-semibold text-lg">Description:</span>
              <div className="mt-1 text-base">{project.description}</div>
            </div>
            <div>
              <span className="font-semibold text-lg">
                Standard Confirmation:
              </span>
              <div className="mt-1 text-base">
                {project.gold_standard_confirmation || "N/A"}
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-2">
              <div>
                <span className="font-semibold">Allocated Amount: </span>
                <span>{project.allocated_amount} tons</span>
              </div>
              <div>
                <span className="font-semibold">Available Amount: </span>
                <span>{project.available_amount} tons</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}