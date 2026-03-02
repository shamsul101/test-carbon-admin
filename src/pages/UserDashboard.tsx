import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/auth";
import {
  TrendingUp,
  TrendingDown,
  Leaf,
  BarChart3,
  Server,
  CreditCard,
  Calendar,
  Loader2,
  DollarSign,
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
import { useEffect, useMemo } from "react";
import { useOffsetStore } from "@/store/offsetStore";
import { useBillingStore } from "@/store/billingStore";
import CustomTooltip from "@/components/CustomTooltip";

const apiGrowthData = [
  { month: "Jan", calls: 1200 },
  { month: "Feb", calls: 1900 },
  { month: "Mar", calls: 2300 },
  { month: "Apr", calls: 2800 },
  { month: "May", calls: 3200 },
  { month: "Jun", calls: 4100 },
];

export default function UserDashboard() {
  const { user, fetchUserProfile } = useUserStore();
  const { accessToken } = useAuthStore();
  const { payments } = useBillingStore();
  const { myOffsets, fetchMyOffsets } = useOffsetStore();

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  // total offsets
  const totalOffsets = useMemo(() => {
    return myOffsets.reduce(
      (total, offset) => total + (offset.total_tons || 0),
      0
    );
  }, [myOffsets]);

  // Calculate offset trend based on latest vs previous transaction
  const offsetComparison = useMemo(() => {
    if (myOffsets.length < 2) {
      return { tons: 0, isPositive: true, hasData: false };
    }

    const latestTons = myOffsets[0]?.total_tons || 0;
    const previousTons = myOffsets[1]?.total_tons || 0;

    const difference = latestTons - previousTons;

    // If difference is 0 or very small
    if (Math.abs(difference) < 0.01) {
      const avgTons =
        myOffsets.reduce((sum, o) => sum + (o.total_tons || 0), 0) /
        myOffsets.length;
      return {
        tons: avgTons,
        isAverage: true,
        isPositive: true,
        hasData: true,
      };
    }

    return {
      tons: Math.abs(difference),
      isAverage: false,
      isPositive: difference > 0,
      hasData: true,
    };
  }, [myOffsets]);

  // last payment
  const lastPayment = myOffsets.length > 0 ? myOffsets[0] : null;

  if (!user) {
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
              <div className="text-carbon-100">Your Emission Lab Dashboard</div>
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

        <div className="flex justify-center items-center h-[calc(100vh-6rem)]">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2 text-muted-foreground">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  console.log("my offset data :: ", myOffsets);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-carbon-gradient rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}
            </h1>
            <p className="text-carbon-100">
              Track and manage carbon emissions and offset projects across your
              platform
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formattedDate}</div>
            <div className="text-carbon-100">Your Emission Lab Dashboard</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Offsets Done
            </CardTitle>
            <Leaf className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalOffsets.toFixed(2)} tons
            </div>
            {offsetComparison.hasData ? (
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-primary" />
                {offsetComparison.isAverage
                  ? `${offsetComparison.tons.toFixed(
                      2
                    )} tons avg per transaction`
                  : `${offsetComparison.tons.toFixed(2)} tons ${
                      offsetComparison.isPositive ? "more" : "less"
                    } than last offset`}
              </div>
            ) : (
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-primary" />
                First offset transaction
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Investment
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              $
              {myOffsets
                .reduce((sum, offset) => sum + offset.total_cost, 0)
                .toFixed(2)}
            </div>
            {myOffsets.length > 0 ? (
              <div className="flex items-center text-xs text-muted-foreground">
                <BarChart3 className="mr-1 h-3 w-3 text-secondary" />
                {myOffsets.length}{" "}
                {myOffsets.length === 1 ? "transaction" : "transactions"} made
              </div>
            ) : (
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-primary" />
                No investments yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {lastPayment ? "Last Payment" : "Payment Information"}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {lastPayment ? (
              <>
                <div className="text-2xl font-bold text-primary">
                  ${lastPayment.total_cost}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3 text-secondary" />
                  {new Date(lastPayment.date).toLocaleDateString()}
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-primary">
                No payments yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
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
                <Tooltip
                  content={
                    <CustomTooltip
                      active={undefined}
                      payload={undefined}
                      label={undefined}
                    />
                  }
                />
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
