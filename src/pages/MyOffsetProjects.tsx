import { useEffect } from "react";
import { useOffsetStore } from "@/store/offsetStore";
import { useAuthStore } from "@/store/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/Pagination";

interface OffsetProject {
  project_name: string;
  tons: number;
}

interface UserOffset {
  transaction_id: string;
  total_tons: number;
  total_cost: number;
  currency: string;
  projects: OffsetProject[];
  status: string;
  date: string;
}

export default function MyOffsetProjects() {
  const { myOffsets, loading, error, fetchMyOffsets } = useOffsetStore();
  const { accessToken } = useAuthStore();

  // Pagination setup
  const {
    currentPage,
    itemsPerPage,
    paginate,
    goToPage,
    handleItemsPerPageChange,
    setCurrentPage,
  } = usePagination<UserOffset>(5);

  const { paginatedItems, totalItems, totalPages, startIndex, endIndex } = paginate(myOffsets);

  useEffect(() => {
    if (accessToken) {
      fetchMyOffsets(accessToken);
    }
  }, [accessToken, fetchMyOffsets]);

  if (loading && myOffsets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Carbon Offsets</h1>
          <p className="text-muted-foreground mt-2">
            View your carbon offset history and impact
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Offsets</h3>
          <p className="text-2xl font-bold text-carbon-700 mt-2">
            {myOffsets.reduce((sum, offset) => sum + offset.total_tons, 0).toFixed(2)} tons
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Investment</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            ${myOffsets.reduce((sum, offset) => sum + offset.total_cost, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Projects Supported</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {new Set(myOffsets.flatMap(offset => 
              offset.projects.map(project => project.project_name)
            )).size}
          </p>
        </div>
      </div>

      {/* Offsets Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Tons Offset</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((offset) => (
              <TableRow key={offset.transaction_id}>
                <TableCell className="font-mono">
                  {offset.transaction_id}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {offset.projects.map((project, index) => (
                      <div key={index} className="text-sm">
                        {project.project_name} ({project.tons.toFixed(2)} tons)
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {offset.total_tons.toFixed(2)} tons
                </TableCell>
                <TableCell>
                  ${offset.total_cost.toFixed(2)} {offset.currency}
                </TableCell>
                <TableCell>
                  {format(new Date(offset.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={offset.status === 'completed' ? 'default' : 'secondary'}
                    className={
                      offset.status === 'completed'
                        ? 'bg-green-500 hover:bg-green-600'
                        : offset.status === 'pending'
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }
                  >
                    <div className="flex items-center gap-1">
                      {offset.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : offset.status === 'pending' ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {offset.status.charAt(0).toUpperCase() + offset.status.slice(1)}
                    </div>
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {myOffsets.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No offset records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {myOffsets.length > 0 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              showItemsPerPage={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}