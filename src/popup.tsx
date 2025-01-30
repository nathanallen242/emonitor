import React, { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Clock,
  Wifi,
  Globe,
  Shield,
  Table,
  Activity,
  List,
  Puzzle
} from "lucide-react"
import { ExtensionStorage } from "~storage"
import type { ExtensionMonitorStore } from "~types/extension"
import ActivityView from "~activity";
import "./globals.css"

const IndexPopup = () => {
  const [store, setStore] = useState<ExtensionMonitorStore | null>(null)

  useEffect(() => {
    const storage = new ExtensionStorage()
    storage.getStore().then((fetchedStore) => {
      setStore(fetchedStore)
    })
  }, [])

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (!store) {
    return (
      <div className="h-[600px] w-[400px] flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  const extensions = Object.values(store.extensions)
  const activeExtensions = extensions.filter((ext) => ext.extension.enabled)

  const chartData = extensions.map((ext) => ({
    name: ext.extension.shortName || ext.extension.name,
    networkRequests: ext.network.totalRequests,
    domains: Object.keys(ext.network.requestsByDomain).length
  }))

  return (
    <Tabs defaultValue="stats" className="flex flex-col h-[600px] w-[400px] bg-white">
      {/* Scrollable area */}
      <div className="flex-1 overflow-auto">
        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="p-4 space-y-6">
            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Active Extensions Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Extensions</CardTitle>
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeExtensions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    out of {extensions.length} total extensions
                  </p>
                </CardContent>
              </Card>

              {/* Total Requests Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Wifi className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {extensions.reduce((sum, ext) => sum + ext.network.totalRequests, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all extensions</p>
                </CardContent>
              </Card>

              {/* Domains Accessed Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb=2">
                  <CardTitle className="text-sm font-medium">Domains Accessed</CardTitle>
                  <Globe className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      new Set(
                        extensions.flatMap((ext) =>
                          Object.keys(ext.network.requestsByDomain)
                        )
                      ).size
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">Unique domains</p>
                </CardContent>
              </Card>

              {/* Permissions Used Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Permissions Used</CardTitle>
                  <Shield className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      new Set(
                        extensions.flatMap((ext) => ext.extension.permissions)
                      ).size
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">Distinct permissions</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <ActivityView extensions={Object.values(store.extensions)} />
        </TabsContent>

        {/* Extensions Tab */}
        <TabsContent value="extensions">
          <div className="p-4 space-y-4">
            {extensions.map((ext) => (
              <Card key={ext.extension.id}>
                <CardHeader className="flex flex-row items-center space-y-0">
                  <div className="flex items-center flex-1 space-x-4">
                    <Avatar className="h-5 w-5">
                      <AvatarImage 
                        src={ext.extension.icons?.[0]?.url} 
                        alt={`${ext.extension.name} icon`}
                      />
                      <AvatarFallback>
                        <Puzzle className="h-6 w-6 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">{ext.extension.name}</CardTitle>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        ext.extension.enabled
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ext.extension.enabled ? "active" : "disabled"}
                    </span>
                  </div>
                </CardHeader>
                <CardDescription className="px-4 pb-2 text-center text-xs italic">
                  {ext.extension.description}
                </CardDescription>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Version</p>
                      <p className="text-lg font-semibold">{ext.extension.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Network Requests</p>
                      <p className="text-lg font-semibold">{ext.network.totalRequests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Domains Accessed</p>
                      <p className="text-lg font-semibold">
                        {Object.keys(ext.network.requestsByDomain).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Permissions</p>
                      <p className="text-lg font-semibold">
                        {ext.extension.permissions.length}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Last request: {formatTimeAgo(ext.network.lastRequest)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </div>

      {/* Sticky Tabs at bottom */}
      <TabsList className="sticky bottom-0 left-0 flex justify-evenly bg-white border-t border-gray-200">
        <TabsTrigger
          value="stats"
          className="flex-1 flex flex-col items-center justify-center py-2"
        >
          <Table className="w-4 h-4 mb-1" />
        </TabsTrigger>
        <TabsTrigger
          value="activity"
          className="flex-1 flex flex-col items-center justify-center py-2"
        >
          <Activity className="w-4 h-4 mb-1" />
        </TabsTrigger>
        <TabsTrigger
          value="extensions"
          className="flex-1 flex flex-col items-center justify-center py-2"
        >
          <List className="w-4 h-4 mb-1" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default IndexPopup
