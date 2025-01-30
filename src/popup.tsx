import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Clock, Wifi, Globe, Shield } from 'lucide-react'
import type { ExtensionMonitorStore, ExtensionStats } from '~types/extension'

const dummyStore: ExtensionMonitorStore = {
  extensions: {
    // ... (keep the same dummy data as in original)
    'ublock@example.com': {
      extension: {
        id: 'ublock@example.com',
        name: 'uBlock Origin',
        enabled: true,
        isTracked: true,
        version: '1.52.2',
        description: 'An efficient blocker',
        lastUpdated: Date.now() - 1000 * 60 * 2,
        permissions: ['tabs', 'storage'],
        hostPermissions: ['<all_urls>'],
        installType: 'normal',
        mayDisable: true,
        type: 'extension',
        shortName: 'uBlock',
        offlineEnabled: false,
        optionsUrl: 'chrome-extension://ublock/options.html',
        isApp: false
      },
      network: {
        extensionId: 'ublock@example.com',
        totalRequests: 1250,
        requestsByType: {
          main_frame: 45,
          sub_frame: 155,
          stylesheet: 230,
          script: 820
        },
        requestsByDomain: {
          'google.com': 250,
          'facebook.com': 180,
          'twitter.com': 120
        },
        lastRequest: Date.now() - 1000 * 60 * 5,
        firstTracked: Date.now() - 1000 * 60 * 60 * 24
      }
    },
    'grammarly@example.com': {
      extension: {
        id: 'grammarly@example.com',
        name: 'Grammarly',
        enabled: true,
        isTracked: true,
        version: '2.1.0',
        description: 'Writing assistant',
        lastUpdated: Date.now() - 1000 * 60 * 15,
        permissions: ['tabs'],
        hostPermissions: ['<all_urls>'],
        installType: 'normal',
        mayDisable: true,
        type: 'extension',
        shortName: 'Grammarly',
        offlineEnabled: false,
        optionsUrl: 'chrome-extension://grammarly/options.html',
        isApp: false
      },
      network: {
        extensionId: 'grammarly@example.com',
        totalRequests: 450,
        requestsByType: {
          xmlhttprequest: 400,
          other: 50
        },
        requestsByDomain: {
          'grammarly.com': 450
        },
        lastRequest: Date.now() - 1000 * 60 * 15,
        firstTracked: Date.now() - 1000 * 60 * 60 * 24
      }
    }
  },
  lastUpdated: Date.now()
}

const IndexPopup = () => {
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const extensions = Object.values(dummyStore.extensions)
  const activeExtensions = extensions.filter(ext => ext.extension.enabled)

  const chartData = extensions.map(ext => ({
    name: ext.extension.shortName,
    networkRequests: ext.network.totalRequests,
    domains: Object.keys(ext.network.requestsByDomain).length
  }))

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Extensions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Extensions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
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
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {extensions.reduce((sum, ext) => sum + ext.network.totalRequests, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all extensions
            </p>
          </CardContent>
        </Card>

        {/* Domains Accessed Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domains Accessed</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(extensions.flatMap(ext => 
                Object.keys(ext.network.requestsByDomain)
              )).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique domains
            </p>
          </CardContent>
        </Card>

        {/* Permissions Used Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions Used</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(extensions.flatMap(ext => 
                ext.extension.permissions
              )).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Distinct permissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Extension Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart width={800} height={300} data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="networkRequests" fill="#8884d8" name="Network Requests" />
            <Bar dataKey="domains" fill="#82ca9d" name="Domains Accessed" />
          </BarChart>
        </CardContent>
      </Card>

      {/* Extension Details List */}
      <div className="space-y-4">
        {extensions.map((ext) => (
          <Card key={ext.extension.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{ext.extension.name}</CardTitle>
              <span className={`px-2 py-1 rounded-full text-xs ${
                ext.extension.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {ext.extension.enabled ? 'active' : 'disabled'}
              </span>
            </CardHeader>
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
                  <p className="text-lg font-semibold">{ext.extension.permissions.length}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Last request: {formatTimeAgo(ext.network.lastRequest)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default IndexPopup