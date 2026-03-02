import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  Mail,
  Building,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";

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

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  isDeletingUser: number | null;
}

export const UserTable = ({
  users,
  loading,
  onEditUser,
  onDeleteUser,
  isDeletingUser,
}: UserTableProps) => {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead className="font-semibold">User</TableHead>
            <TableHead className="font-semibold">Company</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Plan</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">API Usage</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="text-muted-foreground">
                  {loading
                    ? "Loading users..."
                    : "No users found matching your criteria"}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className="hover:bg-muted/50 transition-colors duration-150"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-carbon-100">
                      <AvatarImage
                        src={user.profile_image || ""}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-carbon-gradient text-white font-semibold">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {user.name}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {user.business_profile?.company_name || "N/A"}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      user.role === "business"
                        ? "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                        : "border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100"
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                  >
                    {user.subscription?.plan_name || "No plan"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={user.is_active ? "default" : "secondary"}
                    className={
                      user.is_active
                        ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                        : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                    }
                  >
                    {user.is_active ? (
                      <UserCheck className="mr-1 h-3 w-3" />
                    ) : (
                      <UserX className="mr-1 h-3 w-3" />
                    )}
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      <span className="text-carbon-600">
                        {user.profile.api_requests_made.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground"> / </span>
                      <span className="text-carbon-400">
                        {user.profile.total_requests_limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-carbon-gradient h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (user.profile.api_requests_made /
                              user.profile.total_requests_limit) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditUser(user)}
                      disabled={loading}
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={
                            isDeletingUser === user.id || !user.is_active
                          }
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          {isDeletingUser === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-background border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to deactivate {user.name}?
                            This will set their status to inactive and they
                            won't be able to access the platform.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteUser(user.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
