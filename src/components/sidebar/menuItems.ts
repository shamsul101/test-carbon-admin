
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  CreditCard, 
  Users, 
} from "lucide-react";

export const mainMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "API Documentation",
    url: "/api-docs",
    icon: FileText,
  },
  {
    title: "Blogs",
    url: "/blogs",
    icon: BookOpen,
    subItems: [
      { title: "All Posts", url: "/blogs" },
      { title: "Create Post", url: "/blogs/create" },
      { title: "Categories", url: "/blogs/categories" },
    ]
  },
  {
    title: "Subscriptions",
    url: "/subscriptions",
    icon: CreditCard,
    subItems: [
      { title: "All Plans", url: "/subscriptions" },
      { title: "Create Plan", url: "/subscriptions/create" },
      { title: "Pricing", url: "/subscriptions/pricing" },
    ]
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
    subItems: [
      { title: "All Users", url: "/users" },
      { title: "User Analytics", url: "/users/analytics" },
      { title: "Permissions", url: "/users/permissions" },
    ]
  },
];
