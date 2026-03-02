import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users as UsersIcon, Building2, User, Coins } from "lucide-react";

interface UserStatisticsProps {
  totalUsers: number;
  activeUsers: number;
  businessUsers: number; 
  individualUsers: number; 
  totalOffset: number;
}

export const UserStatistics = ({
  totalUsers,
  activeUsers,
  businessUsers,
  individualUsers,
  totalOffset,
}: UserStatisticsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <UsersIcon className="h-4 w-4 text-carbon-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-carbon-700">
            {totalUsers.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {activeUsers} active users
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Business Users</CardTitle>
          <Building2 className="h-4 w-4 text-carbon-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-carbon-700">
            {businessUsers.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {individualUsers.toLocaleString()} individual users
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Offset By Users
          </CardTitle>
          <Coins className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {totalOffset.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">CO₂ tonnes offset</p>
        </CardContent>
      </Card>
    </div>
  );
};