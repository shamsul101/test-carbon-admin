// components/ProfileCompletePopup.tsx
"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export function ProfileCompletePopup({ onClose }: { onClose?: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-slate-900">
            Complete Your Profile
          </h3>
          <p className="text-slate-600">
            Please complete your profile information in the settings to access
            this section.
          </p>
          <div className="pt-4">
            <Link to="/settings">
              <Button className="w-full bg-green-500 hover:bg-green-700">
                Go to Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
