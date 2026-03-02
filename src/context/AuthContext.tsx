/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, ReactNode } from "react";
import { useAuthStore } from "@/store/auth";

interface AuthContextType {
  user: any;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
