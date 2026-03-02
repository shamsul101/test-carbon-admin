import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Project } from "@/pages/Offset-Projects";
import { Globe } from "lucide-react";

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

  // fnc to safely render HTML content from the rich text editor
  const renderDescription = () => {
    if (!project.description) return null;

    const hasHtmlTags = /<[^>]+>/.test(project.description);

    if (hasHtmlTags) {
      return (
        <div
          className="prose prose-sm max-w-none"
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

      return <div className="space-y-1">{formattedText}</div>;
    }
  };

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
              <div className="mt-2 text-base">{renderDescription()}</div>
            </div>
            <div>
              <span className="font-semibold text-lg">
                Standard Confirmation:
              </span>
              <div className="mt-1 text-base">{project.standard || "N/A"}</div>
            </div>
            {/* <div className="flex flex-wrap gap-6 mt-2">
              <div>
                <span className="font-semibold">Allocated Amount: </span>
                <span>{project.allocated_amount} tons</span>
              </div>
              <div>
                <span className="font-semibold">Available Amount: </span>
                <span>{project.available_amount} tons</span>
              </div>
            </div> */}
          </div>
        </div>

        <style>{`
          .prose h1 {
            font-size: 2em;
            font-weight: bold;
            margin: 0.67em 0;
            line-height: 1.2;
          }
          
          .prose h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0.75em 0;
            line-height: 1.3;
          }
          
          .prose h3 {
            font-size: 1.17em;
            font-weight: bold;
            margin: 0.83em 0;
            line-height: 1.4;
          }
          
          .prose blockquote {
            margin: 1em 0;
            padding: 0.8em 1em;
            border-left: 4px solid #10b981;
            background-color: #f0fdf4;
            font-style: italic;
            color: #374151;
            border-radius: 0 4px 4px 0;
          }
          
          .prose pre {
            background: #f8fafc;
            padding: 1em;
            border-radius: 6px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            border: 1px solid #e2e8f0;
            margin: 1em 0;
            font-size: 0.9em;
            line-height: 1.4;
          }
          
          .prose ul, .prose ol {
            margin: 1em 0;
            padding-left: 2em;
          }
          
          .prose ul {
            list-style-type: disc;
          }
          
          .prose ol {
            list-style-type: decimal;
          }
          
          .prose ul ul {
            list-style-type: circle;
            margin: 0.5em 0;
          }
          
          .prose ul ul ul {
            list-style-type: square;
          }
          
          .prose ol ol {
            list-style-type: lower-alpha;
            margin: 0.5em 0;
          }
          
          .prose ol ol ol {
            list-style-type: lower-roman;
          }
          
          .prose ul ol {
            list-style-type: decimal;
            margin: 0.5em 0;
          }
          
          .prose ol ul {
            list-style-type: disc;
            margin: 0.5em 0;
          }
          
          .prose li {
            margin: 0.5em 0;
            line-height: 1.6;
          }
          
          .prose p {
            margin: 0.8em 0;
            line-height: 1.6;
          }
          
          .prose a {
            color: #2563eb;
            text-decoration: underline;
            text-decoration-color: #93c5fd;
            text-underline-offset: 2px;
          }
          
          .prose a:hover {
            color: #1d4ed8;
            text-decoration-color: #2563eb;
          }
          
          .prose strong, .prose b {
            font-weight: 600;
          }
          
          .prose em, .prose i {
            font-style: italic;
          }
          
          .prose u {
            text-decoration: underline;
            text-underline-offset: 2px;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
