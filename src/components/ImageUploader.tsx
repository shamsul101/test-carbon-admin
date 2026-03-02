import { useState } from 'react';
import { Link, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export default function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(value || '');
  const [showPreview, setShowPreview] = useState(!!value);

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    onChange(url);
    setShowPreview(!!url);
  };

  const removeImage = () => {
    setImageUrl('');
    onChange('');
    setShowPreview(false);
  };

  const handleImageError = () => {
    setShowPreview(false);
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image-url">Image URL</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="pl-10"
              />
            </div>
            {imageUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeImage}
                className="px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a direct link to an image (PNG, JPG, JPEG, GIF, WebP)
          </p>
        </div>

        {showPreview && imageUrl && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="relative">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-300"
                onError={handleImageError}
                onLoad={() => setShowPreview(true)}
              />
            </div>
          </div>
        )}

        {!showPreview && imageUrl && (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              Unable to load image preview. Please check the URL is correct and accessible.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}