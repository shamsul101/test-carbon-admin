import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";

interface CreateUserDialogProps {
  onCreateUser: (userData: {
    email: string;
    name: string;
    role: "individual" | "business";
    password: string;
  }) => Promise<void>;
  isCreating: boolean;
  createError: string | null;
}

export const CreateUserDialog = ({
  onCreateUser,
  isCreating,
  createError,
}: CreateUserDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "individual" as "individual" | "business",
    password: "",
  });

  const handleSubmit = async () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      return;
    }

    try {
      await onCreateUser(newUser);
      setIsDialogOpen(false);
      setNewUser({
        email: "",
        name: "",
        role: "individual",
        password: "",
      });
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const isFormValid = newUser.email && newUser.name && newUser.password;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-carbon-gradient hover:bg-carbon-600 shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] bg-background border-2">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold">Add New User</DialogTitle>
          <DialogDescription className="text-base">
            Create a new user account for the carbon tracking platform
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address*
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="user@example.com"
                className="h-11 border-2 focus:border-carbon-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Full Name*
              </Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                placeholder="John Doe"
                className="h-11 border-2 focus:border-carbon-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold">
                Account Type*
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(value: "individual" | "business") =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger className="h-11 border-2">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border">
                  <SelectItem value="individual">Individual Account</SelectItem>
                  <SelectItem value="business">Business Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password*
              </Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                placeholder="Set a secure password"
                className="h-11 border-2 focus:border-carbon-500"
              />
            </div>
          </div>

          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-700 text-sm font-medium">
                {createError}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isCreating}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating || !isFormValid}
            className="bg-carbon-gradient hover:bg-carbon-600 px-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create User"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
