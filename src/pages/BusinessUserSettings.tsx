import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Briefcase,
  Phone,
  MapPin,
  Link,
  Loader2,
  AlertCircle,
  Zap,
  Lock,
  Edit,
  X,
  Check,
  Info,
} from "lucide-react";
import NotificationSettings from "./NotificationSettings";
import ApiKeyManager from "./ApiKeyManager";
import { toast } from "sonner";
import ProfileImageUpload from "@/components/ProfileImageUpload";

export default function BusinessUserSettings() {
  const [editMode, setEditMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const changePassword = useAuthStore((state) => state.changePassword);

  const {
    user,
    loading,
    error,
    fetchUserProfile,
    updateUserProfile,
    updateBusinessProfile,
    regenerateApiKey,
  } = useUserStore();

  const { accessToken } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    company_name: "",
    company_registration_number: "",
    industry: "",
    company_size: "",
    website: "",
    company_address: "",
    phone_number: "",
    contact_person: "",
    annual_revenue: "",
  });

  // Initialize form
  useEffect(() => {
    if (accessToken) {
      fetchUserProfile(accessToken);
    }
  }, [accessToken, fetchUserProfile]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        company_name: user.business_profile?.company_name || "",
        company_registration_number:
          user.business_profile?.company_registration_number || "",
        industry: user.business_profile?.industry || "",
        company_size: user.business_profile?.company_size || "",
        website: user.business_profile?.website || "",
        company_address: user.business_profile?.company_address || "",
        phone_number: user.business_profile?.phone_number || "",
        contact_person: user.business_profile?.contact_person || "",
        annual_revenue: user.business_profile?.annual_revenue || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        updateUserProfile(accessToken, {
          name: formData.name,
          email: formData.email,
          bio: formData.bio,
        }),
        updateBusinessProfile(accessToken, {
          company_name: formData.company_name,
          company_registration_number: formData.company_registration_number,
          industry: formData.industry,
          company_size: formData.company_size,
          website: formData.website,
          company_address: formData.company_address,
          phone_number: formData.phone_number,
          contact_person: formData.contact_person,
          annual_revenue: formData.annual_revenue,
        }),
      ]);
      toast.success("Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
        toast.error("User not found");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (newPassword.length < 5) {
        toast.error("Password must be at least 5 characters");
        return;
      }
      try {
        setIsPasswordLoading(true);
        await changePassword(user.id, newPassword, accessToken);
        toast.success("Password changed successfully");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        console.error("Password change error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to change password"
        );
      } finally {
        setIsPasswordLoading(false);
      }
    },
    [newPassword, confirmPassword, user, accessToken, changePassword]
  );

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        <AlertCircle className="inline mr-2" />
        Error: {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-600">
        No user data available
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Business Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal and business information
          </p>
        </div>
        <div>
          {!editMode ? (
            <Button
              variant="outline"
              onClick={() => setEditMode(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditMode(false)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Profile Header Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-border mb-8">
            <div className="flex-shrink-0">
              <ProfileImageUpload
                currentImage={user.profile_image}
                onUploadSuccess={(imageUrl) => {
                  fetchUserProfile(accessToken);
                }}
              />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h2 className="text-2xl font-bold">{formData.name || "Business User"}</h2>
              <p className="text-muted-foreground">{formData.email}</p>
              {formData.bio && (
                <p className="text-sm text-muted-foreground italic">{formData.bio}</p>
              )}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                {formData.company_name && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">
                    <Briefcase className="h-3 w-3" />
                    {formData.company_name}
                  </span>
                )}
                {formData.industry && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                    {formData.industry}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Full Name</Label>
                    {editMode ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="text-sm font-medium">{formData.name}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">
                      Email Address
                    </Label>
                    {editMode ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="text-sm font-medium">{formData.email}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Bio</Label>
                  {editMode ? (
                    <Input
                      id="bio"
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {formData.bio || "No bio provided"}
                    </p>
                  )}
                </div>
              </div>

              {/* Business Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2 text-primary">
                  <Briefcase className="h-5 w-5" />
                  Business Information
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">
                      Company Name
                    </Label>
                    {editMode ? (
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="text-sm font-medium">
                        {formData.company_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">
                      Registration Number
                    </Label>
                    {editMode ? (
                      <Input
                        id="company_registration_number"
                        value={formData.company_registration_number}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="text-sm font-medium">
                        {formData.company_registration_number}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Industry</Label>
                    {editMode ? (
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {formData.industry}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">
                      Company Size
                    </Label>
                    {editMode ? (
                      <Input
                        id="company_size"
                        value={formData.company_size}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="text-sm font-medium">
                        {formData.company_size}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Website
                  </Label>
                  {editMode ? (
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  ) : formData.website ? (
                    <a
                      href={
                        formData.website.startsWith("http")
                          ? formData.website
                          : `https://${formData.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {formData.website}
                    </a>
                  ) : (
                    <p className="text-sm font-medium">No website provided</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Company Address
                  </Label>
                  {editMode ? (
                    <Input
                      id="company_address"
                      value={formData.company_address}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {formData.company_address || "No address provided"}
                    </p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    {editMode ? (
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="text-sm font-medium">
                        {formData.phone_number || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">
                      Contact Person
                    </Label>
                    {editMode ? (
                      <Input
                        id="contact_person"
                        value={formData.contact_person}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="text-sm font-medium">
                        {formData.contact_person || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Annual Revenue
                  </Label>
                  {editMode ? (
                    <Input
                      id="annual_revenue"
                      value={formData.annual_revenue}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {formData.annual_revenue || "Not disclosed"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fixed API Usage Section */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            API Settings
          </CardTitle>
          <CardDescription>
            Manage your API key and integration settings
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ApiKeyManager
            apiKey={user.profile?.emission_lab_key}
            accessToken={accessToken}
            onRegenerate={() => regenerateApiKey(accessToken)}
            loading={loading}
          />
          <div className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">API Usage</h3>
                <p className="text-sm text-muted-foreground">
                  {user.profile?.api_requests_made || 0} /{" "}
                  {user.profile?.total_requests_limit || "Unlimited"} requests
                  used
                </p>
              </div>
              <div className="w-64 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((Number(user?.profile?.api_requests_made) || 0) /
                        (Number(user?.profile?.total_requests_limit) || 1)) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}