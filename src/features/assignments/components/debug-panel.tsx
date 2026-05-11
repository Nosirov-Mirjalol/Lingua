import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AssignmentsDebugPanel() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testEndpoint = async () => {
    addLog('Testing assignments endpoint...')
    try {
      const response = await fetch('http://185.190.143.64:8000/api/assignments/')
      const data = await response.json()
      addLog(`Response status: ${response.status}`)
      addLog(`Response data: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      addLog(`Error: ${error}`)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>API Debug Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Button onClick={testEndpoint} className="w-full">
              Test Assignments API
            </Button>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Debug Logs:</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-64 overflow-y-auto text-sm font-mono">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No logs yet...</div>
              )}
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            <p><strong>Current API URL:</strong> http://185.190.143.64:8000/api/assignments/</p>
            <p><strong>Expected Endpoint:</strong> GET /api/assignments/</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
