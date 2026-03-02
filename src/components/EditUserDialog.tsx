/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface User {
  id: number;
  email: string;
  name: string;
  role: "individual" | "business" | "super_admin";
  is_active: boolean;
  profile_image: string | null;
  bio?: string;
  profile: {
    api_requests_made: number;
    total_requests_limit: number;
  };
  business_profile: {
    company_name: string;
    industry?: string;
    company_size?: string;
    website?: string;
    company_address?: string;
    phone_number?: string;
    contact_person?: string;
    annual_revenue?: string;
    company_registration_number?: string;
  } | null;
  subscription: {
    plan_name: string;
    status: string;
  } | null;
}

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: (userData: any) => Promise<void>;
  isEditing: boolean;
  editError: string | null;
}

export const EditUserDialog = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  isEditing,
  editError,
}: EditUserDialogProps) => {
  const [editUser, setEditUser] = useState({
    name: "",
    bio: "",
    business_profile: {
      company_name: "",
      industry: "",
      company_size: "",
      website: "",
      company_address: "",
      phone_number: "",
      contact_person: "",
      annual_revenue: "",
      company_registration_number: "",
    },
  });

  useEffect(() => {
    if (user) {
      setEditUser({
        name: user.name || "",
        bio: user.bio || "",
        business_profile: {
          company_name: user.business_profile?.company_name || "",
          industry: user.business_profile?.industry || "",
          company_size: user.business_profile?.company_size || "",
          website: user.business_profile?.website || "",
          company_address: user.business_profile?.company_address || "",
          phone_number: user.business_profile?.phone_number || "",
          contact_person: user.business_profile?.contact_person || "",
          annual_revenue: user.business_profile?.annual_revenue || "",
          company_registration_number:
            user.business_profile?.company_registration_number || "",
        },
      });
    }
  }, [user]);

  const hasEditChanges = useMemo(() => {
    if (!user) return false;

    const hasNameChange = editUser.name !== (user.name || "");
    const hasBioChange = editUser.bio !== (user.bio || "");

    const hasBusinessProfileChanges =
      user.role === "business" &&
      (editUser.business_profile.company_name !==
        (user.business_profile?.company_name || "") ||
        editUser.business_profile.industry !==
          (user.business_profile?.industry || "") ||
        editUser.business_profile.company_size !==
          (user.business_profile?.company_size || "") ||
        editUser.business_profile.website !==
          (user.business_profile?.website || "") ||
        editUser.business_profile.company_address !==
          (user.business_profile?.company_address || "") ||
        editUser.business_profile.phone_number !==
          (user.business_profile?.phone_number || "") ||
        editUser.business_profile.contact_person !==
          (user.business_profile?.contact_person || "") ||
        editUser.business_profile.annual_revenue !==
          (user.business_profile?.annual_revenue || "") ||
        editUser.business_profile.company_registration_number !==
          (user.business_profile?.company_registration_number || ""));

    return hasNameChange || hasBioChange || hasBusinessProfileChanges;
  }, [user, editUser]);

  const handleSubmit = async () => {
    if (!user) return;

    const updateData: any = {
      name: editUser.name,
      bio: editUser.bio,
    };

    if (user.role === "business") {
      updateData.business_profile = editUser.business_profile;
    }

    await onUpdateUser(updateData);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-background border-2 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold">Edit User</DialogTitle>
          <DialogDescription className="text-base">
            Update user information and business profile
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold border-b pb-2">
              Basic Information
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-semibold">
                  Full Name
                </Label>
                <Input
                  id="edit-name"
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="h-11 border-2 focus:border-carbon-500"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-bio" className="text-sm font-semibold">
                  Bio
                </Label>
                <Textarea
                  id="edit-bio"
                  value={editUser.bio}
                  onChange={(e) =>
                    setEditUser({ ...editUser, bio: e.target.value })
                  }
                  placeholder="User bio..."
                  rows={3}
                  className="border-2 focus:border-carbon-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Business Profile */}
          {user.role === "business" && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold border-b pb-2">
                Business Profile
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-company-name"
                    className="text-sm font-semibold"
                  >
                    Company Name
                  </Label>
                  <Input
                    id="edit-company-name"
                    value={editUser.business_profile.company_name}
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        business_profile: {
                          ...editUser.business_profile,
                          company_name: e.target.value,
                        },
                      })
                    }
                    placeholder="Company Name"
                    className="h-11 border-2 focus:border-carbon-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-industry"
                    className="text-sm font-semibold"
                  >
                    Industry
                  </Label>
                  <Input
                    id="edit-industry"
                    value={editUser.business_profile.industry}
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        business_profile: {
                          ...editUser.business_profile,
                          industry: e.target.value,
                        },
                      })
                    }
                    placeholder="Technology"
                    className="h-11 border-2 focus:border-carbon-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-company-size"
                    className="text-sm font-semibold"
                  >
                    Company Size
                  </Label>
                  <Input
                    id="edit-company-size"
                    value={editUser.business_profile.company_size}
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        business_profile: {
                          ...editUser.business_profile,
                          company_size: e.target.value,
                        },
                      })
                    }
                    placeholder="Small, Medium, Large"
                    className="h-11 border-2 focus:border-carbon-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-website"
                    className="text-sm font-semibold"
                  >
                    Website
                  </Label>
                  <Input
                    id="edit-website"
                    value={editUser.business_profile.website}
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        business_profile: {
                          ...editUser.business_profile,
                          website: e.target.value,
                        },
                      })
                    }
                    placeholder="https://example.com"
                    className="h-11 border-2 focus:border-carbon-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-sm font-semibold">
                    Phone Number
                  </Label>
                  <Input
                    id="edit-phone"
                    value={editUser.business_profile.phone_number}
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        business_profile: {
                          ...editUser.business_profile,
                          phone_number: e.target.value,
                        },
                      })
                    }
                    placeholder="+1-555-0123"
                    className="h-11 border-2 focus:border-carbon-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-contact-person"
                    className="text-sm font-semibold"
                  >
                    Contact Person
                  </Label>
                  <Input
                    id="edit-contact-person"
                    value={editUser.business_profile.contact_person}
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        business_profile: {
                          ...editUser.business_profile,
                          contact_person: e.target.value,
                        },
                      })
                    }
                    placeholder="John Doe"
                    className="h-11 border-2 focus:border-carbon-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-annual-revenue"
                    className="text-sm font-semibold"
                  >
                    Annual Revenue
                  </Label>
                  <Input
                    id="edit-annual-revenue"
                    value={editUser.business_profile.annual_revenue}
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        business_profile: {
                          ...editUser.business_profile,
                          annual_revenue: e.target.value,
                        },
                      })
                    }
                    placeholder="$1,000,000"
                    className="h-11 border-2 focus:border-carbon-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-registration-number"
                    className="text-sm font-semibold"
                  >
                    Registration Number
                  </Label>
                  <Input
                    id="edit-registration-number"
                    value={
                      editUser.business_profile.company_registration_number
                    }
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        business_profile: {
                          ...editUser.business_profile,
                          company_registration_number: e.target.value,
                        },
                      })
                    }
                    placeholder="REG123456"
                    className="h-11 border-2 focus:border-carbon-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-company-address"
                  className="text-sm font-semibold"
                >
                  Company Address
                </Label>
                <Textarea
                  id="edit-company-address"
                  value={editUser.business_profile.company_address}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      business_profile: {
                        ...editUser.business_profile,
                        company_address: e.target.value,
                      },
                    })
                  }
                  placeholder="123 Business Street, City, State, ZIP"
                  rows={2}
                  className="border-2 focus:border-carbon-500 resize-none"
                />
              </div>
            </div>
          )}

          {editError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-700 text-sm font-medium">
                {editError}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isEditing}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isEditing || !hasEditChanges}
            className="bg-carbon-gradient hover:bg-carbon-600 px-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isEditing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update User"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
