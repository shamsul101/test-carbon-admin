import { useState, useEffect, useCallback } from "react";
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
import { User, Lock, Bell, Zap, Loader2, UserCheck, Edit, X, Check } from "lucide-react";
import NotificationSettings from "./NotificationSettings";
import { useAuthStore } from "@/store/auth";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import ApiKeyManager from "./ApiKeyManager";
import ProfileImageUpload from "@/components/ProfileImageUpload";

export default function UserSettings() {
  const {
    user,
    loading,
    error,
    fetchUserProfile,
    updateUserProfile,
    regenerateApiKey,
  } = useUserStore();
  const { accessToken } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
    const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const changePassword = useAuthStore((state) => state.changePassword);
  const [profileSettings, setProfileSettings] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // user profile on mount
  useEffect(() => {
    if (accessToken) {
      fetchUserProfile(accessToken);
    }
  }, [accessToken, fetchUserProfile]);

  // updating form
  useEffect(() => {
    if (user) {
      setProfileSettings((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (profileSettings.newPassword !== profileSettings.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      await updateUserProfile(accessToken, {
        name: profileSettings.name,
        email: profileSettings.email,
        ...(profileSettings.newPassword && {
          password: profileSettings.newPassword,
          current_password: profileSettings.currentPassword,
        }),
      });
      toast.success("Profile updated successfully");
      setEditMode(false);
      // Clear password fields after successful update
      setProfileSettings((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  };

  
  const handlePasswordChange = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log("handlePasswordChange triggered");

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


  if (loading && !user) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8 mx-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">User Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal account settings
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
                onClick={handleSaveProfile}
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

      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Header Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-border mb-8">
              <div className="flex-shrink-0">
                <ProfileImageUpload
                  currentImage={user?.profile_image}
                  onUploadSuccess={(imageUrl) => {
                    fetchUserProfile(accessToken);
                  }}
                />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <h2 className="text-2xl font-bold">{profileSettings.name || "User"}</h2>
                <p className="text-muted-foreground">{profileSettings.email}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                    <UserCheck className="h-3 w-3" />
                    Active User
                  </span>
                  {user?.role && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 capitalize">
                      {user.role}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground">Full Name</Label>
                {editMode ? (
                  <Input
                    id="name"
                    value={profileSettings.name}
                    onChange={(e) =>
                      setProfileSettings({
                        ...profileSettings,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-sm font-medium">{profileSettings.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
                {editMode ? (
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) =>
                      setProfileSettings({
                        ...profileSettings,
                        email: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-sm font-medium">{profileSettings.email}</p>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

              <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={5}
                />
              </div>
            </div>
            <div className="flex justify-start">
              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

        <NotificationSettings />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              System Integrations
            </CardTitle>
            <CardDescription>
              Configure API and third-party integration settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <ApiKeyManager
                apiKey={user.profile.emission_lab_key}
                accessToken={accessToken}
                onRegenerate={regenerateApiKey}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}