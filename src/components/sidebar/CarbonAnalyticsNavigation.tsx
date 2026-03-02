
import { Link } from "react-router-dom";
import { BarChart3, Calculator, Globe } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface CarbonAnalyticsNavigationProps {
  isActive: (url: string) => boolean;
}

export function CarbonAnalyticsNavigation({ isActive }: CarbonAnalyticsNavigationProps) {
  const analyticsItems = [
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Calculator",
      url: "/calculator",
      icon: Calculator,
    },
    {
      title: "Offset Projects",
      url: "/offsets",
      icon: Globe,
    },
  ];

  return (
    <SidebarMenu className="space-y-2">
      {analyticsItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <Link 
              to={item.url} 
              className="flex items-center space-x-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
