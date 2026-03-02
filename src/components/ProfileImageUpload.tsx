import { useState, useRef, ChangeEvent } from "react";
import { Loader2, Camera, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";

export default function ProfileImageUpload({
  currentImage,
  onUploadSuccess,
}: {
  currentImage?: string;
  onUploadSuccess?: (imageUrl: string) => void;
}) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accessToken } = useAuthStore();
  const { uploadProfileImage } = useUserStore();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("profile_image", fileInputRef.current.files[0]);

      const response = await uploadProfileImage(accessToken, formData);

      toast.success(response.message);
      setPreviewImage(null);
      if (onUploadSuccess) {
        onUploadSuccess(response.profile_image);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload profile image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayImage = previewImage || currentImage;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
          {displayImage ? (
            <img
              src={
                displayImage.startsWith("/media/")
                  ? `${import.meta.env.VITE_API_URL}${displayImage}`
                  : displayImage
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <User className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        <label
          htmlFor="profile-upload"
          className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
        >
          <Camera className="h-5 w-5 text-white" />
          <input
            id="profile-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </label>
      </div>

      {previewImage && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
