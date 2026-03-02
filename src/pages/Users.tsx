/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/auth";
import { useUsersStore } from "@/store/users";
import { mockUsers } from "@/data/mockUsers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOffsetStore } from "@/store/offsetStore";
import { useUserFilters } from "@/hooks/useUserFilters";
import { CreateUserDialog } from "@/components/CreateUserDialog";
import { UserStatistics } from "@/components/UserStatistics";
import { UserFilters } from "@/components/UserFilters";
import { UserTable } from "@/components/UserTable";
import { Pagination } from "@/components/Pagination";
import { EditUserDialog } from "@/components/EditUserDialog";

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

export default function Users() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    apiUsers,
    filteredUsers,
    loading,
    totalCount,
    filteredCount,
    fetchUsers,
    createUser,
    updateUser,
    updateUserStatus,
  } = useUsersStore();

  const { filters, updateFilters } = useUserFilters();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Create user states
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit user states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Delete user states
  const [isDeletingUser, setIsDeletingUser] = useState<number | null>(null);

  const { offsetHistory, fetchOffsetHistory } = useOffsetStore();

  // users when filters or auth changes
  useEffect(() => {
    if (accessToken) {
      fetchUsers(accessToken, filters);
    }
  }, [accessToken, filters, fetchUsers]);

  // offset history on mount
  useEffect(() => {
    if (accessToken) {
      fetchOffsetHistory(accessToken);
    }
  }, [accessToken, fetchOffsetHistory]);

  // reseting pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const availablePlans = useMemo(
    () => [
      ...Array.from(
        new Set(
          apiUsers
            .map((user) => user.subscription?.plan_name)
            .filter(Boolean) as string[]
        )
      ),
    ],
    [apiUsers]
  );

  // calculating statistics
  const businessUsers = useMemo(() => {
    return apiUsers.filter((user) => user.role === "business").length;
  }, [apiUsers]);

  const individualUsers = useMemo(() => {
    return apiUsers.filter((user) => user.role === "individual").length;
  }, [apiUsers]);

  const totalOffset = offsetHistory.reduce(
    (sum, offset) => sum + offset.carbon_emission_metric_tons,
    0
  );
  const activeUsers = apiUsers.filter((user) => user.is_active).length;

  // pagination for filtered data
  const startIndex =
    filteredCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredCount);
  const totalPages = Math.ceil(filteredCount / itemsPerPage);

  const handleCreateUser = async (userData: {
    email: string;
    name: string;
    role: "individual" | "business";
    password: string;
  }) => {
    if (!userData.email || !userData.name || !userData.password) {
      setCreateError("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      await createUser(accessToken, userData);
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to create user"
      );
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
    setEditError(null);
  };

  const handleUpdateUser = async (userData: any) => {
    if (!selectedUser) return;

    setIsEditing(true);
    setEditError(null);

    try {
      await updateUser(accessToken, selectedUser.id, userData);
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Failed to update user"
      );
      throw error;
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setIsDeletingUser(userId);

    try {
      await updateUserStatus(accessToken, userId, false);
    } catch (error) {
      console.error("Failed to deactivate user:", error);
    } finally {
      setIsDeletingUser(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            User Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage user accounts, permissions, and carbon tracking data
          </p>
        </div>

        <CreateUserDialog
          onCreateUser={handleCreateUser}
          isCreating={isCreating}
          createError={createError}
        />
      </div>

      {/* Statistics Cards */}
      <UserStatistics
        totalUsers={totalCount}
        activeUsers={activeUsers}
        businessUsers={businessUsers}
        individualUsers={individualUsers}
        totalOffset={totalOffset}
      />

      {/* User Management Card */}
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl">User Directory</CardTitle>
          <CardDescription className="text-base">
            Manage user accounts and track their carbon impact with advanced
            filtering
            {filteredCount !== totalCount && (
              <span className="text-gray-600 text-sm font-medium ml-2">
                ({filteredCount} of {totalCount} users match filters)
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <UserFilters
            filters={filters}
            onFiltersChange={updateFilters}
            availablePlans={availablePlans}
          />

          {/* Table */}
          <UserTable
            users={paginatedUsers}
            loading={loading}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            isDeletingUser={isDeletingUser}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredCount}
              startIndex={startIndex}
              endIndex={endIndex}
              showItemsPerPage={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUpdateUser={handleUpdateUser}
        isEditing={isEditing}
        editError={editError}
      />
    </div>
  );
}
