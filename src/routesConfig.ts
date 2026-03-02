import { ComponentType } from "react";
import ApiDocs from "./pages/ApiDocs";
import Blogs from "./pages/Blogs";
import Subscriptions from "./pages/Subscriptions";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Faqs from "./pages/Faq";
import Billing from "./pages/Billing";
import Queries from "./pages/Queries";
import OffsetProjects from "./pages/Offset-Projects";
import MyOffsetProjects from "./pages/MyOffsetProjects";
import { Login } from "./pages/Login";
import Register from "./pages/Register";
import MySubscription from "./pages/mySubscriptions";
import Pricing from "./pages/Pricing";
import SettingsPage from "./app/(dashboard)/settings/page";
import BlogDetails from "./pages/BlogDetails";
import ContactPage from "./pages/ContactPage";
import TermsAndConditions from "./pages/Terms";
import DashboardPage from "./app/(dashboard)/dashboard/page";
import OffsetHistory from "./pages/OffsetHistory";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentCancel from "./components/PaymentCancel";

// route objects
export interface AppRoute {
  path: string;
  component: ComponentType;
  layout?: "dashboard";
  roles?: string[];
}

export const routes: AppRoute[] = [
  // Public routes (no authentication required)
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  
  // Dashboard routes (authentication required)
  {
    path: "/api-docs",
    component: ApiDocs,
    layout: "dashboard",
    roles: ["super_admin", "business"],
  },
  {
    path: "/blogs",
    component: Blogs,
    layout: "dashboard",
    roles: ["super_admin"],
  },
  {
    path: "/blogs/:id",
    component: BlogDetails,
    layout: "dashboard",
    roles: ["super_admin", "business", "individual"],
  },
  // {
  //   path: "/blogs/create",
  //   component: BlogDetails,
  //   layout: "dashboard",
  //   roles: ["super_admin"],
  // },
  {
    path: "/subscriptions",
    component: Subscriptions,
    layout: "dashboard",
    roles: ["super_admin", "business", "individual"],
  },
  {
    path: "/subscriptions/my-subscription",
    component: MySubscription,
    layout: "dashboard",
    roles: ["business", "individual"],
  },
  {
    path: "/subscriptions/pricing",
    component: Pricing,
    layout: "dashboard",
    roles: ["business", "individual"],
  },
  {
    path: "/subscriptions/payment/success",
    component: PaymentSuccess,
    layout: "dashboard",
    roles: ["business", "individual"],
  },
  {
    path: "/subscriptions/payment/cancel",
    component: PaymentCancel,
    layout: "dashboard",
    roles: ["business", "individual"],
  },
  {
    path: "/users",
    component: Users,
    layout: "dashboard",
    roles: ["super_admin"],
  },
  {
    path: "/contact",
    component: ContactPage,
    layout: "dashboard",
    roles: ["business"],
  },
  {
    path: "/settings",
    component: SettingsPage,
    layout: "dashboard",
    roles: ["super_admin", "business", "individual"],
  },
  {
    path: "/offset-projects",
    component: OffsetProjects,
    layout: "dashboard",
    roles: ["super_admin"],
  },
  {
    path: "/offset-history",
    component: OffsetHistory,
    layout: "dashboard",
    roles: ["super_admin"],
  },
  {
    path: "/myOffsetProjects",
    component: MyOffsetProjects,
    layout: "dashboard",
    roles: ["business", "individual"],
  },
  {
    path: "/faqs",
    component: Faqs,
    layout: "dashboard",
    roles: ["super_admin"],
  },
  {
    path: "/billing",
    component: Billing,
    layout: "dashboard",
    roles: ["super_admin", "business"],
  },
  {
    path: "/queries",
    component: Queries,
    layout: "dashboard",
    roles: ["super_admin"],
  },
  {
    path: "/terms",
    component: TermsAndConditions,
    layout: "dashboard",
    roles: ["super_admin", "business", "individual"],
  },

  // Catch-all route (should be last)
  { path: "*", component: NotFound },
];