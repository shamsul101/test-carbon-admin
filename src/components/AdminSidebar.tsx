import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Users,
  Globe,
  FileQuestion,
  MailQuestion,
  Settings,
  ChevronDown,
  ChevronRight,
  DollarSign as DollarSignIcon,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/store/auth";

type MenuItemBase = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: string[];
};

type MenuItemWithSubItems = MenuItemBase & {
  hasSubItems: true;
  subItems?: Array<{ title: string; url: string; roles?: string[] }>;
};

type MenuItemWithoutSubItems = MenuItemBase & {
  hasSubItems?: false;
};

type MenuItem = MenuItemWithSubItems | MenuItemWithoutSubItems;

const baseMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["super_admin", "business", "individual"],
    hasSubItems: false,
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
    roles: ["super_admin"],
    hasSubItems: false,
  },
  {
    title: "Subscriptions",
    url: "/subscriptions",
    icon: CreditCard,
    roles: ["super_admin", "business", "individual"],
    hasSubItems: true,
  },
  {
    title: "Blogs",
    url: "/blogs",
    icon: BookOpen,
    roles: ["super_admin"],
    hasSubItems: false,
  },
  {
    title: "FAQ",
    url: "/faqs",
    icon: FileQuestion,
    roles: ["super_admin"],
    hasSubItems: false,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: DollarSignIcon,
    roles: ["super_admin", "business"],
    hasSubItems: false,
  },
  {
    title: "Queries",
    url: "/queries",
    icon: MailQuestion,
    roles: ["super_admin"],
    hasSubItems: false,
  },
  {
    title: "Contact Admin",
    url: "/contact",
    icon: Mail,
    roles: ["business"],
    hasSubItems: false,
  },
  {
    title: "Offset Projects",
    url: "/offset-projects",
    icon: Globe,
    roles: ["super_admin"],
    hasSubItems: false,
  },
  {
    title: "Offset History",
    url: "/offset-history",
    icon: Globe,
    roles: ["super_admin"],
    hasSubItems: false,
  },
  {
    title: "My Offset History",
    url: "/myOffsetProjects",
    icon: Globe,
    roles: ["business", "individual"],
    hasSubItems: false,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["super_admin", "business", "individual"],
    hasSubItems: false,
  },
];

export function AdminSidebar() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const location = useLocation();
  const [openItems, setOpenItems] = useState<string[]>([]);

  // Get subscription sub-items based on role
  const getSubscriptionItems = (role: string) => {
    const items = [];

    if (role === "super_admin") {
      items.push({
        title: "All Plans",
        url: "/subscriptions",
        roles: ["super_admin"],
      });
    }

    if (role === "business" || role === "individual") {
      items.push(
        {
          title: "Pricing",
          url: "/subscriptions/pricing",
          roles: ["business", "individual"],
        },
        {
          title: "My Plans",
          url: "/subscriptions/my-subscription",
          roles: ["business", "individual"],
        }
      );
    }

    return items;
  };

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  // Process menu items with dynamic sub-items
  const processedMenuItems = baseMenuItems.map((item) => {
    if (item.title === "Subscriptions" && item.hasSubItems && role) {
      return {
        ...item,
        hasSubItems: true,
        subItems: getSubscriptionItems(role),
      };
    }
    return item;
  });

  // Filter items based on user role
  const filteredMenuItems = processedMenuItems.filter(
    (item) => role && item.roles.includes(role)
  );

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden">
            <img
              src="/carbon-Fav.png"
              alt="Logo"
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              Emission Lab{" "}
            </h2>
            {role === "super_admin" ? (
              <p className="text-sm text-sidebar-foreground/70">
                Admin Dashboard
              </p>
            ) : role === "individual" ? (
              <p className="text-sm text-sidebar-foreground/70">
                User Dashboard
              </p>
            ) : (
              <p className="text-sm text-sidebar-foreground/70">
                Business Dashboard
              </p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium uppercase tracking-wider mb-4">
            Main Navigations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {filteredMenuItems.map((item) => {
                // For items with sub-items, also filter sub-items by role
                if (item.hasSubItems && item.subItems) {
                  const filteredSubItems = item.subItems.filter(
                    (subItem) =>
                      !subItem.roles || (role && subItem.roles.includes(role))
                  );

                  // Don't show the parent item if it has no visible sub-items
                  if (filteredSubItems.length === 0) {
                    return null;
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <Collapsible
                        open={openItems.includes(item.title)}
                        onOpenChange={() => toggleItem(item.title)}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "w-full justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              isActive(item.url) &&
                                "bg-sidebar-accent text-sidebar-accent-foreground"
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            {openItems.includes(item.title) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-6 mt-2 space-y-1">
                            {filteredSubItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <Link
                                    to={subItem.url}
                                    className={cn(
                                      "text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                      isActive(subItem.url) &&
                                        "bg-sidebar-accent text-sidebar-accent-foreground"
                                    )}
                                  >
                                    {subItem.title}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                }

                // Regular menu items without sub-items
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center space-x-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive(item.url) &&
                            "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
