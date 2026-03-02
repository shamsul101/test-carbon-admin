
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  CreditCard, 
  Users, 
  ChevronDown, 
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { mainMenuItems } from "./menuItems";

interface MainNavigationProps {
  openItems: string[];
  toggleItem: (title: string) => void;
  isActive: (url: string) => boolean;
}

export function MainNavigation({ openItems, toggleItem, isActive }: MainNavigationProps) {
  return (
    <SidebarMenu className="space-y-2">
      {mainMenuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          {item.subItems ? (
            <Collapsible
              open={openItems.includes(item.title)}
              onOpenChange={() => toggleItem(item.title)}
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className={cn(
                    "w-full justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive(item.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
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
                  {item.subItems.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link
                          to={subItem.url}
                          className={cn(
                            "text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive(subItem.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
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
          ) : (
            <SidebarMenuButton asChild>
              <Link
                to={item.url}
                className={cn(
                  "flex items-center space-x-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive(item.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
