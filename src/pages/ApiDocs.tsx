
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Copy, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Key,
  Globe,
  Lock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const apiEndpoints = [
  {
    id: 1,
    method: "GET",
    endpoint: "/api/v1/emissions",
    description: "Retrieve carbon emission data",
    category: "Emissions",
    isPublic: true,
    parameters: ["userId", "dateRange", "category"],
    response: {
      "data": [
        {
          "id": "em_123",
          "userId": "user_456",
          "amount": 125.5,
          "unit": "tons_co2",
          "category": "transportation",
          "date": "2024-06-15"
        }
      ]
    }
  },
  {
    id: 2,
    method: "POST",
    endpoint: "/api/v1/emissions",
    description: "Submit new carbon emission data",
    category: "Emissions",
    isPublic: false,
    parameters: ["amount", "category", "date", "metadata"],
    response: {
      "success": true,
      "data": {
        "id": "em_789",
        "status": "recorded"
      }
    }
  },
  {
    id: 3,
    method: "GET",
    endpoint: "/api/v1/offsets",
    description: "Get carbon offset information",
    category: "Offsets",
    isPublic: true,
    parameters: ["projectId", "type", "status"],
    response: {
      "data": [
        {
          "id": "off_123",
          "projectName": "Amazon Rainforest Protection",
          "amount": 500,
          "unit": "tons_co2",
          "status": "verified"
        }
      ]
    }
  },
  {
    id: 4,
    method: "POST",
    endpoint: "/api/v1/offsets/purchase",
    description: "Purchase carbon offsets",
    category: "Offsets",
    isPublic: false,
    parameters: ["projectId", "amount", "paymentMethod"],
    response: {
      "success": true,
      "transactionId": "tx_456789",
      "amount": 250,
      "status": "completed"
    }
  }
];

export default function ApiDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(apiEndpoints[0]);
  const [newEndpoint, setNewEndpoint] = useState({
    method: "GET",
    endpoint: "",
    description: "",
    category: "Emissions",
    isPublic: true,
    parameters: [""]
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleAddEndpoint = () => {
    console.log("Adding new endpoint:", newEndpoint);
  };

  const handleEditEndpoint = (id: number) => {
    console.log("Editing endpoint:", id);
  };

  const handleDeleteEndpoint = (id: number) => {
    console.log("Deleting endpoint:", id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">API Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive API reference for carbon emission and offset management
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-carbon-gradient hover:bg-carbon-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Endpoint
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] bg-background border">
            <DialogHeader>
              <DialogTitle>Add New API Endpoint</DialogTitle>
              <DialogDescription>
                Create a new API endpoint for the documentation
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="method" className="text-right">Method</Label>
                <Select value={newEndpoint.method} onValueChange={(value) => setNewEndpoint({...newEndpoint, method: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border">
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endpoint" className="text-right">Endpoint</Label>
                <Input
                  id="endpoint"
                  value={newEndpoint.endpoint}
                  onChange={(e) => setNewEndpoint({...newEndpoint, endpoint: e.target.value})}
                  placeholder="/api/v1/example"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea
                  id="description"
                  value={newEndpoint.description}
                  onChange={(e) => setNewEndpoint({...newEndpoint, description: e.target.value})}
                  placeholder="Describe what this endpoint does"
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleAddEndpoint} className="bg-carbon-gradient">
              Add Endpoint
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-carbon-600" />
              API Endpoints
            </CardTitle>
            <CardDescription>Browse available API endpoints</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {apiEndpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  className={`p-4 cursor-pointer border-l-4 hover:bg-muted/50 transition-colors ${
                    selectedEndpoint.id === endpoint.id 
                      ? 'border-l-carbon-500 bg-carbon-50' 
                      : 'border-l-transparent'
                  }`}
                  onClick={() => setSelectedEndpoint(endpoint)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                      className={
                        endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                        endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }
                    >
                      {endpoint.method}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {endpoint.isPublic ? (
                        <Globe className="h-3 w-3 text-green-500" />
                      ) : (
                        <Lock className="h-3 w-3 text-yellow-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEndpoint(endpoint.id);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEndpoint(endpoint.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{endpoint.endpoint}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {endpoint.description}
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {endpoint.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge 
                  variant="default"
                  className={
                    selectedEndpoint.method === 'GET' ? 'bg-blue-500' :
                    selectedEndpoint.method === 'POST' ? 'bg-green-500' :
                    selectedEndpoint.method === 'PUT' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }
                >
                  {selectedEndpoint.method}
                </Badge>
                <code className="text-lg font-mono">{selectedEndpoint.endpoint}</code>
              </div>
              <div className="flex items-center gap-2">
                {selectedEndpoint.isPublic ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Globe className="mr-1 h-3 w-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    <Lock className="mr-1 h-3 w-3" />
                    Private
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription>{selectedEndpoint.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{selectedEndpoint.description}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                    <p className="text-muted-foreground">
                      {selectedEndpoint.isPublic 
                        ? "This endpoint is publicly accessible and does not require authentication."
                        : "This endpoint requires API key authentication. Include your API key in the Authorization header."
                      }
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Rate Limiting</h3>
                    <p className="text-muted-foreground">
                      This endpoint is rate limited to 1000 requests per hour per API key.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="parameters" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Parameters</h3>
                  <div className="space-y-3">
                    {selectedEndpoint.parameters.map((param, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <code className="font-mono text-sm bg-muted px-2 py-1 rounded">{param}</code>
                          <Badge variant="outline">string</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Description for the {param} parameter. This parameter is used to filter or specify data.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="response" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Response Format</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(selectedEndpoint.response, null, 2))}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm overflow-x-auto">
                      <code>{JSON.stringify(selectedEndpoint.response, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="examples" className="space-y-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">cURL Example</h3>
                    <div className="bg-muted rounded-lg p-4">
                      <code className="text-sm">
                        curl -X {selectedEndpoint.method} \<br/>
                        &nbsp;&nbsp;"https://api.emissionlab.com{selectedEndpoint.endpoint}" \<br/>
                        &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br/>
                        &nbsp;&nbsp;-H "Content-Type: application/json"
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">JavaScript Example</h3>
                    <div className="bg-muted rounded-lg p-4">
                      <code className="text-sm">
                        const response = await fetch('https://api.emissionlab.com{selectedEndpoint.endpoint}', {`{`}<br/>
                        &nbsp;&nbsp;method: '{selectedEndpoint.method}',<br/>
                        &nbsp;&nbsp;headers: {`{`}<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;'Authorization': 'Bearer YOUR_API_KEY',<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;'Content-Type': 'application/json'<br/>
                        &nbsp;&nbsp;{`}`}<br/>
                        {`}`});
                      </code>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* API Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-carbon-600" />
              Total Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-carbon-700">{apiEndpoints.length}</div>
            <p className="text-muted-foreground text-sm">Active API endpoints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">147</div>
            <p className="text-muted-foreground text-sm">Active API keys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Monthly Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">89.2K</div>
            <p className="text-muted-foreground text-sm">API requests this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
