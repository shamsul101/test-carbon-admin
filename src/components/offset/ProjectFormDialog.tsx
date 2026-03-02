/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "../RichTextEditor";
import { useState, useEffect } from "react";

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

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  formData: ProjectFormData;
  onFormDataChange: (data: ProjectFormData) => void;
  imagePreview: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageClear: () => void;
  validationReportFile: File | null;
  monitoringReportFile: File | null;
  onValidationReportUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMonitoringReportUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidationReportClear: () => void;
  onMonitoringReportClear: () => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel: string;
  currentImageUrl?: string;
  currentValidationReport?: string;
  currentMonitoringReport?: string;
}

export default function ProjectFormDialog({
  open,
  onOpenChange,
  title,
  description,
  formData,
  onFormDataChange,
  imagePreview,
  onImageUpload,
  onImageClear,
  validationReportFile,
  monitoringReportFile,
  onValidationReportUpload,
  onMonitoringReportUpload,
  onValidationReportClear,
  onMonitoringReportClear,
  onSubmit,
  loading,
  submitLabel,
  currentImageUrl,
  currentValidationReport,
  currentMonitoringReport,
}: ProjectFormDialogProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (formData.allocated_amount === 0 && formData.available_amount === 0) {
      onFormDataChange({
        ...formData,
        allocated_amount: 1000,
        available_amount: 1000
      });
    }
  }, [formData.allocated_amount, formData.available_amount]);

  // if all required fields are filled
  const isFormValid = () => {
    if (!formData.name.trim()) return false;
    
    // description - handle both empty HTML and plain text
    const descriptionText = formData.description.trim();
    if (!descriptionText || 
        descriptionText === '<p></p>' || 
        descriptionText === '<p><br></p>' ||
        descriptionText === '') return false;
    
    // identification number
    if (!formData.identification_number.trim()) return false;
    
    // price per ton
    if (!formData.price_per_ton.trim()) return false;
    
    // if price is a valid positive number
    const price = parseFloat(formData.price_per_ton);
    if (isNaN(price) || price <= 0) return false;
    
    return true;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }
    
    if (!formData.description.trim() || 
        formData.description === '<p></p>' || 
        formData.description === '<p><br></p>') {
      newErrors.description = "Description is required";
    }
    
    if (!formData.identification_number.trim()) {
      newErrors.identification_number = "Identification number is required";
    }
    
    if (!formData.price_per_ton.trim()) {
      newErrors.price_per_ton = "Price per ton is required";
    } else if (parseFloat(formData.price_per_ton) <= 0) {
      newErrors.price_per_ton = "Price must be greater than 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  const handleFormDataChange = (updatedData: ProjectFormData) => {
    // Clear error for the field being updated
    const fieldName = Object.keys(updatedData).find(
      key => formData[key as keyof ProjectFormData] !== updatedData[key as keyof ProjectFormData]
    );
    if (fieldName && errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    onFormDataChange(updatedData);
  };

  const isSubmitDisabled = !isFormValid() || loading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-background border max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 p-4 px-4">
          {/* Required: Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name" className="flex items-center gap-1">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="project-name"
              value={formData.name}
              onChange={(e) =>
                handleFormDataChange({ ...formData, name: e.target.value })
              }
              placeholder="Enter project name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Optional: Project Image */}
          <div className="space-y-2">
            <Label htmlFor="project-image">Project Image (Optional)</Label>
            <Input
              id="project-image"
              type="file"
              accept="image/*"
              onChange={onImageUpload}
            />
            {currentImageUrl && !imagePreview && (
              <div className="text-sm text-muted-foreground">
                Current image will be replaced if you upload a new one.
              </div>
            )}
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
                  onClick={onImageClear}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {!imagePreview && currentImageUrl && (
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border">
                <img
                  src={currentImageUrl}
                  alt="Current image"
                  className="w-full h-full object-cover"
                />
                <div className="text-xs text-center text-muted-foreground mt-1">
                  Current Image
                </div>
              </div>
            )}
          </div>

          {/* Required: Description */}
          <div className="space-y-2">
            <Label htmlFor="project-description" className="flex items-center gap-1">
              Description <span className="text-red-500">*</span>
            </Label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) =>
                handleFormDataChange({
                  ...formData,
                  description: value,
                })
              }
              placeholder="Enter project description. Use the toolbar to format text, create lists, add headings, and more..."
              className={`w-full ${errors.description ? "border-red-500 rounded-md" : ""}`}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Optional: Project Type and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-type">Project Type (Optional)</Label>
              <Input
                id="project-type"
                value={formData.project_type}
                onChange={(e) =>
                  handleFormDataChange({
                    ...formData,
                    project_type: e.target.value,
                  })
                }
                placeholder="e.g., Reforestation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-location">Location (Optional)</Label>
              <Input
                id="project-location"
                value={formData.location}
                onChange={(e) =>
                  handleFormDataChange({
                    ...formData,
                    location: e.target.value,
                  })
                }
                placeholder="e.g., Brazil"
              />
            </div>
          </div>

          {/* Optional: Standard and Required: Identification Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-standard">Standard (Optional)</Label>
              <Input
                id="project-standard"
                value={formData.standard}
                onChange={(e) =>
                  handleFormDataChange({
                    ...formData,
                    standard: e.target.value,
                  })
                }
                placeholder="e.g., VCS, Gold Standard"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-id-number" className="flex items-center gap-1">
                Identification Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="project-id-number"
                value={formData.identification_number}
                onChange={(e) =>
                  handleFormDataChange({
                    ...formData,
                    identification_number: e.target.value,
                  })
                }
                placeholder="Project ID"
                className={errors.identification_number ? "border-red-500" : ""}
              />
              {errors.identification_number && (
                <p className="text-sm text-red-500">{errors.identification_number}</p>
              )}
            </div>
          </div>

          {/* Optional: Vintage and Info Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-vintage">Vintage Year (Optional)</Label>
              <Input
                id="project-vintage"
                value={formData.vintage}
                onChange={(e) =>
                  handleFormDataChange({
                    ...formData,
                    vintage: e.target.value,
                  })
                }
                placeholder="e.g., 2023"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-info-link">Info Link (Optional)</Label>
              <Input
                id="project-info-link"
                type="url"
                value={formData.info_link}
                onChange={(e) =>
                  handleFormDataChange({
                    ...formData,
                    info_link: e.target.value,
                  })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Optional: Validation Report */}
          <div className="space-y-2">
            <Label htmlFor="project-validation-report">
              Validation Report (PDF) (Optional)
            </Label>
            <Input
              id="project-validation-report"
              type="file"
              accept=".pdf"
              onChange={onValidationReportUpload}
            />
            {validationReportFile ? (
              <div className="flex items-center gap-2 text-sm text-primary">
                <FileText className="h-4 w-4" />
                <span>{validationReportFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={onValidationReportClear}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : currentValidationReport ? (
              <a
                href={currentValidationReport}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                View Current Report
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">
                No report uploaded
              </span>
            )}
          </div>

          {/* Optional: Monitoring Report */}
          <div className="space-y-2">
            <Label htmlFor="project-monitoring-report">
              Monitoring Report (PDF) (Optional)
            </Label>
            <Input
              id="project-monitoring-report"
              type="file"
              accept=".pdf"
              onChange={onMonitoringReportUpload}
            />
            {monitoringReportFile ? (
              <div className="flex items-center gap-2 text-sm text-primary">
                <FileText className="h-4 w-4" />
                <span>{monitoringReportFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={onMonitoringReportClear}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : currentMonitoringReport ? (
              <a
                href={currentMonitoringReport}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                View Current Report
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">
                No report uploaded
              </span>
            )}
          </div>

          {/* Required: Price per Ton and Optional: Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-price" className="flex items-center gap-1">
                Price per Ton <span className="text-red-500">*</span>
              </Label>
              <Input
                id="project-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price_per_ton}
                onChange={(e) =>
                  handleFormDataChange({
                    ...formData,
                    price_per_ton: e.target.value,
                  })
                }
                placeholder="0.00"
                className={errors.price_per_ton ? "border-red-500" : ""}
              />
              {errors.price_per_ton && (
                <p className="text-sm text-red-500">{errors.price_per_ton}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-currency">Currency (Optional)</Label>
              <Input
                id="project-currency"
                value={formData.currency}
                onChange={(e) =>
                  handleFormDataChange({
                    ...formData,
                    currency: e.target.value,
                  })
                }
                placeholder="USD"
              />
            </div>
          </div>

          {/* Optional: Default Switch */}
          <div className="flex items-center gap-2 mt-2">
            <Switch
              checked={formData.is_default}
              onCheckedChange={() =>
                handleFormDataChange({
                  ...formData,
                  is_default: !formData.is_default,
                })
              }
              id="project-default"
            />
            <Label htmlFor="project-default">
              {formData.is_default ? "Default" : "Not Default"} (Optional)
            </Label>
          </div>
        </div>
        <div className="flex justify-center px-4 pb-4 gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`bg-carbon-gradient w-full ${isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Processing..." : submitLabel}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}