import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ExtensionStats } from "~types/extension";

interface ChartDataPoint {
  name: string;
  permissions: number;
  requests: number;
  domains: number;
}

interface PermissionSummary {
  name: string;
  count: number;
}

interface ActivityViewProps {
  extensions: ExtensionStats[];
}

// Helper function to get top 5 most common permissions
const getTopPermissions = (extensions: ExtensionStats[]): PermissionSummary[] => {
  const permCount: Record<string, number> = extensions.reduce((acc, ext) => {
    ext.extension.permissions.forEach(perm => {
      acc[perm] = (acc[perm] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(permCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
};

// Helper function to process chart data
const processChartData = (exts: ExtensionStats[]): ChartDataPoint[] => {
  return exts.map(ext => ({
    name: ext.extension.shortName || ext.extension.name.substring(0, 15),
    permissions: ext.extension.permissions.length,
    requests: ext.network.totalRequests,
    domains: Object.keys(ext.network.requestsByDomain).length
  }));
};

const ActivityView: React.FC<ActivityViewProps> = ({ extensions }) => {
  // Group extensions into chunks of 3 for better visualization
  const chunkSize = 3;
  const extensionChunks: ExtensionStats[][] = extensions.reduce((chunks, ext, index) => {
    const chunkIndex = Math.floor(index / chunkSize);
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }
    chunks[chunkIndex].push(ext);
    return chunks;
  }, [] as ExtensionStats[][]);

  return (
    <div className="space-y-6 p-4">
      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Overview 📈</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Showing activity for {extensions.length} extensions
        </CardContent>
      </Card>

      {/* Permission Charts */}
      {extensionChunks.map((chunk, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm">
              Extensions Group {index + 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processChartData(chunk)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{ fontSize: '12px' }}
                    labelStyle={{ fontSize: '12px' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }}
                    verticalAlign="top"
                  />
                  <Bar 
                    dataKey="permissions" 
                    fill="#8884d8" 
                    name="Permissions"
                  />
                  <Bar 
                    dataKey="requests" 
                    fill="#82ca9d" 
                    name="Requests"
                  />
                  <Bar 
                    dataKey="domains" 
                    fill="#ffc658" 
                    name="Domains"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Permissions Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Most Common Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getTopPermissions(extensions).map((perm, index) => (
              <div 
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-muted-foreground">{perm.name}</span>
                <span className="font-medium">{perm.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityView;