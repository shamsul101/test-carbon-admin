
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings as SettingsIcon, 
  User, 
  Mail, 
  Lock, 
  Calculator,
  Leaf,
  Globe,
  Bell,
  Database,
  Shield,
  Zap
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const [profileSettings, setProfileSettings] = useState({
    name: "Admin User",
    email: "admin@emissionlab.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [carbonSettings, setCarbonSettings] = useState({
    defaultUnit: "metric_tons",
    offsetCalculationMethod: "gold_standard",
    automaticReporting: true,
    carbonPricing: 25.50,
    offsetBuffer: 10,
    emissionFactorSource: "epa_2024"
  });

  const [systemSettings, setSystemSettings] = useState({
    emailNotifications: true,
    reportReminders: true,
    dataRetention: 7,
    backupFrequency: "daily",
    maintenanceMode: false,
    debugMode: false
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    apiRateLimit: 1000,
    webhookUrl: "",
    thirdPartyIntegrations: true,
    dataExport: true,
    realTimeUpdates: true
  });

  const handleSaveProfile = () => {
    console.log("Saving profile settings:", profileSettings);
  };

  const handleSaveCarbon = () => {
    console.log("Saving carbon settings:", carbonSettings);
  };

  const handleSaveSystem = () => {
    console.log("Saving system settings:", systemSettings);
  };

  const handleSaveIntegration = () => {
    console.log("Saving integration settings:", integrationSettings);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure system settings, carbon calculations, and platform preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="carbon" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Carbon Settings
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-carbon-600" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileSettings.name}
                    onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5 text-carbon-600" />
                  Change Password
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={profileSettings.currentPassword}
                      onChange={(e) => setProfileSettings({...profileSettings, currentPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={profileSettings.newPassword}
                      onChange={(e) => setProfileSettings({...profileSettings, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={profileSettings.confirmPassword}
                      onChange={(e) => setProfileSettings({...profileSettings, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveProfile} className="bg-carbon-gradient">
                Save Profile Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carbon" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-carbon-600" />
                Carbon Calculation Settings
              </CardTitle>
              <CardDescription>
                Configure how carbon emissions and offsets are calculated and displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultUnit">Default Carbon Unit</Label>
                  <Select value={carbonSettings.defaultUnit} onValueChange={(value) => setCarbonSettings({...carbonSettings, defaultUnit: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border">
                      <SelectItem value="metric_tons">Metric Tons CO₂e</SelectItem>
                      <SelectItem value="kilograms">Kilograms CO₂e</SelectItem>
                      <SelectItem value="pounds">Pounds CO₂e</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offsetMethod">Offset Calculation Method</Label>
                  <Select value={carbonSettings.offsetCalculationMethod} onValueChange={(value) => setCarbonSettings({...carbonSettings, offsetCalculationMethod: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border">
                      <SelectItem value="gold_standard">Gold Standard</SelectItem>
                      <SelectItem value="vcs">Verified Carbon Standard (VCS)</SelectItem>
                      <SelectItem value="cdm">Clean Development Mechanism</SelectItem>
                      <SelectItem value="car">Climate Action Reserve</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="carbonPricing">Carbon Price ($/ton CO₂e)</Label>
                  <Input
                    id="carbonPricing"
                    type="number"
                    step="0.01"
                    value={carbonSettings.carbonPricing}
                    onChange={(e) => setCarbonSettings({...carbonSettings, carbonPricing: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offsetBuffer">Offset Buffer (%)</Label>
                  <Input
                    id="offsetBuffer"
                    type="number"
                    value={carbonSettings.offsetBuffer}
                    onChange={(e) => setCarbonSettings({...carbonSettings, offsetBuffer: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emissionSource">Emission Factor Source</Label>
                <Select value={carbonSettings.emissionFactorSource} onValueChange={(value) => setCarbonSettings({...carbonSettings, emissionFactorSource: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border">
                    <SelectItem value="epa_2024">EPA 2024</SelectItem>
                    <SelectItem value="ipcc_2021">IPCC 2021</SelectItem>
                    <SelectItem value="defra_2024">DEFRA 2024</SelectItem>
                    <SelectItem value="custom">Custom Factors</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="automaticReporting"
                  checked={carbonSettings.automaticReporting}
                  onCheckedChange={(checked) => setCarbonSettings({...carbonSettings, automaticReporting: checked})}
                />
                <Label htmlFor="automaticReporting">Enable automatic monthly reporting</Label>
              </div>

              <Button onClick={handleSaveCarbon} className="bg-carbon-gradient">
                Save Carbon Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-carbon-600" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure email notifications and system alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotifications"
                  checked={systemSettings.emailNotifications}
                  onCheckedChange={(checked) => setSystemSettings({...systemSettings, emailNotifications: checked})}
                />
                <Label htmlFor="emailNotifications">Send email notifications for important events</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="reportReminders"
                  checked={systemSettings.reportReminders}
                  onCheckedChange={(checked) => setSystemSettings({...systemSettings, reportReminders: checked})}
                />
                <Label htmlFor="reportReminders">Send report submission reminders</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-carbon-600" />
                Data Management
              </CardTitle>
              <CardDescription>
                Configure data retention and backup settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention (years)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    value={systemSettings.dataRetention}
                    onChange={(e) => setSystemSettings({...systemSettings, dataRetention: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings({...systemSettings, backupFrequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border">
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-carbon-600" />
                System Controls
              </CardTitle>
              <CardDescription>
                Advanced system settings and maintenance options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                />
                <Label htmlFor="maintenanceMode">Enable maintenance mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="debugMode"
                  checked={systemSettings.debugMode}
                  onCheckedChange={(checked) => setSystemSettings({...systemSettings, debugMode: checked})}
                />
                <Label htmlFor="debugMode">Enable debug mode</Label>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveSystem} className="bg-carbon-gradient">
            Save System Settings
          </Button>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-carbon-600" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure API settings and rate limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  value={integrationSettings.apiRateLimit}
                  onChange={(e) => setIntegrationSettings({...integrationSettings, apiRateLimit: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  placeholder="https://your-webhook-url.com/endpoint"
                  value={integrationSettings.webhookUrl}
                  onChange={(e) => setIntegrationSettings({...integrationSettings, webhookUrl: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-carbon-600" />
                External Integrations
              </CardTitle>
              <CardDescription>
                Manage third-party integrations and data sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="thirdPartyIntegrations"
                  checked={integrationSettings.thirdPartyIntegrations}
                  onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, thirdPartyIntegrations: checked})}
                />
                <Label htmlFor="thirdPartyIntegrations">Enable third-party integrations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="dataExport"
                  checked={integrationSettings.dataExport}
                  onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, dataExport: checked})}
                />
                <Label htmlFor="dataExport">Allow data export</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="realTimeUpdates"
                  checked={integrationSettings.realTimeUpdates}
                  onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, realTimeUpdates: checked})}
                />
                <Label htmlFor="realTimeUpdates">Enable real-time updates</Label>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveIntegration} className="bg-carbon-gradient">
            Save Integration Settings
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
