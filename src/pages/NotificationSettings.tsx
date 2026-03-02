import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";

interface NotificationSettingsProps {
  emailNotifications?: boolean;
  reportReminders?: boolean;
  onEmailNotificationsChange?: (checked: boolean) => void;
  onReportRemindersChange?: (checked: boolean) => void;
}

export default function NotificationSettings({
  emailNotifications = true,
  reportReminders = true,
  onEmailNotificationsChange,
  onReportRemindersChange
}: NotificationSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure your notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="emailNotifications" className="flex-1">
            Email notifications
          </Label>
          <Input
            id="emailNotifications"
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => onEmailNotificationsChange?.(e.target.checked)}
            className="h-5 w-5"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="reportReminders" className="flex-1">
            Report reminders
          </Label>
          <Input
            id="reportReminders"
            type="checkbox"
            checked={reportReminders}
            onChange={(e) => onReportRemindersChange?.(e.target.checked)}
            className="h-5 w-5"
          />
        </div>
      </CardContent>
    </Card>
  );
}