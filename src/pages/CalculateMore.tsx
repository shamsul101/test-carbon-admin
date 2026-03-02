import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/auth";
import { useOffsetStore } from "@/store/offsetStore";
import { useEffect } from "react";
import { ArrowRight, Heart } from "lucide-react";

export default function CarbonMotivationPage() {
  const { user, fetchUserProfile } = useUserStore();
  const { accessToken, refreshToken } = useAuthStore();
  const { myOffsets, fetchMyOffsets } = useOffsetStore();

  useEffect(() => {
    if (accessToken && !user) {
      fetchUserProfile(accessToken);
    }
    if (accessToken) {
      fetchMyOffsets(accessToken);
    }
  }, [accessToken, user, fetchUserProfile, fetchMyOffsets]);

  const userStats = {
    totalOffsets: myOffsets.reduce(
      (sum, offset) => sum + (offset.total_tons || 0),
      0
    ),
  };

  const handleNavigateToCalculator = () => {
    window.open(
  `https://uat.aiemissionlab.com/calculator?refresh=${refreshToken}`,
  "_blank",
  "noopener,noreferrer"
);

  };

  return (
    <div className="space-y-8 mx-auto">
      {/* Header */}
      <div className="bg-carbon-gradient rounded-lg p-6 text-white">
        <div className="max-w-5xl space-y-2">
          <h1 className="text-3xl font-bold">Carbon Offset Summary</h1>
          <p className="text-lg text-carbon-100">
            You have offset{" "}
            <span className="font-semibold">
              {userStats.totalOffsets.toFixed(2)} tons
            </span>{" "}
            of CO₂ so far.
          </p>
        </div>
      </div>

      {/* Continuation Guidance */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Keep Your Emissions Data Up to Date
        </h2>

        <p className="text-muted-foreground">
          As activities continue, your emissions profile evolves. Periodic
          recalculation helps ensure your data remains accurate and reflective
          of current operations.
        </p>

        <p className="text-muted-foreground">
          You may want to calculate again after operational changes, additional
          travel, new energy usage data, or updates to suppliers and logistics.
        </p>

        <p className="text-muted-foreground">
          Updating calculations allows you to take timely offset actions and
          maintain consistency between reported emissions and offset coverage.
        </p>
      </section>

      {/* Impact Details */}
      <Card className="border-none p-0 shadow-none">
        <CardContent className="pt-8 p-0">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold">Why This Matters</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Keeping emissions data up to date supports transparency and
                  aligns carbon management efforts with sustainability goals.
                </p>
                <p>
                  Accurate calculations improve decision-making around reduction
                  strategies and offset planning.
                </p>
              </div>
            </div>

            <div className="rounded-xl p-6 border">
              <div className="text-center space-y-3">
                <div className="text-lg font-medium">Total Offsets</div>
                <div className="text-3xl font-bold text-primary">
                  {userStats.totalOffsets.toFixed(2)} tons
                </div>
                <div className="text-sm text-muted-foreground">
                  CO₂ offset to date
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <Button
          onClick={handleNavigateToCalculator}
          size="lg"
          className="bg-carbon-gradient text-white px-10 py-6 rounded-xl text-lg font-semibold shadow-md hover:opacity-90"
        >
          <div className="flex items-center gap-3">
            <span>Open Carbon Calculator</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </Button>
      </div>
    </div>
  );
}
