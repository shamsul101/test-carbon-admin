/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/auth";
import { useUserStore } from "@/store/userStore";
import {
  TrendingUp,
  TrendingDown,
  Leaf,
  Server,
  CreditCard,
  Calendar,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useBillingStore } from "@/store/billingStore";
import { useMySubscriptionStore } from "@/store/mySubscription";
import { useEffect, useMemo } from "react";
import { useOffsetStore } from "@/store/offsetStore";

const apiGrowthData = [
  { month: "Jan", calls: 1200 },
  { month: "Feb", calls: 1900 },
  { month: "Mar", calls: 2300 },
  { month: "Apr", calls: 2800 },
  { month: "May", calls: 3200 },
  { month: "Jun", calls: 4100 },
];

export default function BusinessDashboard() {
  const { user, loading, fetchUserProfile } = useUserStore();
  const { accessToken } = useAuthStore();
  const { payments } = useBillingStore();
  const { subscription } = useMySubscriptionStore();
  const { myOffsets, fetchMyOffsets } = useOffsetStore();

  // user profile on component mount
  useEffect(() => {
    if (accessToken && !user) {
      fetchUserProfile(accessToken);
    }
    if (accessToken) {
      fetchMyOffsets(accessToken);
    }
  }, [accessToken, user, fetchUserProfile, fetchMyOffsets]);

  // offset data for chart
  const offsetData = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const currentYear = new Date().getFullYear();

    // Initialize data for all months with zeros
    const monthlyData = monthNames.map((month, index) => ({
      month: `${month} ${currentYear.toString().slice(-2)}`,
      offset: 0,
      count: 0,
      monthIndex: index,
    }));

    // Process each offset transaction
    myOffsets.forEach((offset) => {
      if (offset.date) {
        const date = new Date(offset.date);
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        // Only process transactions from current year
        if (year === currentYear) {
          monthlyData[monthIndex].offset += offset.total_tons || 0;
          monthlyData[monthIndex].count += 1;
        }
      }
    });

    return monthlyData;
  }, [myOffsets]);

  // tooltip component for the offset chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium">{`${label}`}</p>
          <p className="text-sm text-green-600">
            {`Offsets: ${data.offset.toFixed(2)} tons`}
          </p>
          <p className="text-xs text-gray-500">
            {`${data.count} transaction${data.count !== 1 ? "s" : ""}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // total offsets
  const totalOffsets = useMemo(() => {
    return myOffsets.reduce(
      (total, offset) => total + (offset.total_tons || 0),
      0
    );
  }, [myOffsets]);

  // total API calls
  const totalApiCalls = user?.profile?.api_requests_made || 0;

  // total CO₂
  const totalCO2 = 3.2; // Placeholder (mock)

  // Format date for display
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // last payment
  const lastPayment = payments.length > 0 ? payments[0] : null;

  // loading state while fetching user
  if (loading && !user) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-carbon-gradient rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-64 bg-white/20 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-96 bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formattedDate}</div>
              <div className="text-carbon-100">Your Dashboard</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2 text-muted-foreground">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-carbon-gradient rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="text-carbon-100">
              Track your API usage, carbon calculations, and offset activities
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formattedDate}</div>
            <div className="text-carbon-100">Your Dashboard</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              API Calls Made
            </CardTitle>
            <Server className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalApiCalls}
            </div>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              {user?.profile?.total_requests_limit ? (
                <>
                  <Progress
                    value={
                      user?.profile?.total_requests_limit && totalApiCalls
                        ? (Number(totalApiCalls) /
                            Number(user.profile.total_requests_limit)) *
                          100
                        : 0
                    }
                    className="h-2 mr-2 w-full"
                  />
                  {user?.profile?.total_requests_limit && totalApiCalls
                    ? Math.round(
                        (Number(totalApiCalls) /
                          Number(user.profile.total_requests_limit)) *
                          100
                      )
                    : 0}
                  % of your limit
                </>
              ) : (
                "Unlimited plan"
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total CO₂ Calculated
            </CardTitle>
            <Leaf className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalCO2.toFixed(1)} tons
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +15% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Offsets Done
            </CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalOffsets.toFixed(2)} tons
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +10% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {lastPayment ? "Last Payment" : "Payment Information"}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {lastPayment ? (
              <>
                <div className="text-2xl font-bold text-purple-600">
                  ${lastPayment.amount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(lastPayment.payment_date).toLocaleDateString()}
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-purple-600">
                No payments yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Monthly Carbon Offsets
            </CardTitle>
            <CardDescription>
              Carbon offsets purchased by month (metric tons)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={offsetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="offset"
                  stroke="#22c55e"
                  strokeWidth={3}
                  name="Offsets (tons)"
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#22c55e", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* API Growth Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              API Call Growth
            </CardTitle>
            <CardDescription>Monthly API request trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={apiGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Offset Activities</CardTitle>
          <CardDescription>
            Your latest carbon offset transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myOffsets.slice(0, 5).map((offset, index) => (
              <div
                key={offset.transaction_id || index}
                className="flex items-center justify-between py-3 border-b last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div>
                    <div className="font-medium">
                      {offset.projects?.[0]?.project_name || "Carbon Offset"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {offset.total_tons?.toFixed(2)} tons • {offset.currency}{" "}
                      {offset.total_cost?.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {offset.date
                      ? new Date(offset.date).toLocaleDateString()
                      : "Unknown date"}
                  </div>
                  <Badge
                    variant={
                      offset.status === "completed" ? "default" : "secondary"
                    }
                    className="mt-1"
                  >
                    {offset.status}
                  </Badge>
                </div>
              </div>
            ))}
            {myOffsets.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No offset transactions yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
