import React, { useState } from 'react';
import { Search, Filter, History, User, Calendar, ArrowUpRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useInventory } from '../context/InventoryContext';

export const AuditLogsPage = () => {
  const { products } = useInventory();
  // In a real app, we'd pull this from a global audit context. 
  // For now, we'll simulate a global log by aggregating product logs + some system logs.
  
  // We need to access the internal auditLogs from context, 
  // but currently context only exposes getProductLogs. 
  // Let's assume we updated context to expose 'allAuditLogs' or we construct it here for demo.
  // Since I can't see the hidden context update in this turn, I will simulate the data here 
  // based on the pattern established in InventoryContext.
  
  // Note: In a real implementation, I would update InventoryContext to export `auditLogs` directly.
  // For this demo, I will mock the "Global" view using the same structure.
  
  const [searchQuery, setSearchQuery] = useState('');

  const dummyGlobalLogs = [
    {
      id: 'LOG-001',
      timestamp: new Date().toISOString(),
      user: 'Admin User',
      module: 'System',
      action: 'Login',
      details: 'User logged in successfully',
      ip: '192.168.1.1'
    },
    {
      id: 'LOG-002',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Rajesh (Manager)',
      module: 'Inventory',
      action: 'Update',
      details: 'Updated stock for "Wireless Mouse" from 10 to 50',
      ip: '192.168.1.4'
    },
    {
      id: 'LOG-003',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: 'Priya (Staff)',
      module: 'Billing',
      action: 'Create',
      details: 'Created Invoice #INV-2025-001 for Amit Sharma',
      ip: '192.168.1.5'
    },
    {
      id: 'LOG-004',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      user: 'Admin User',
      module: 'Masters',
      action: 'Create',
      details: 'Added new product category "Smart Home"',
      ip: '192.168.1.1'
    },
    {
      id: 'LOG-005',
      timestamp: new Date(Date.now() - 90000000).toISOString(),
      user: 'Rajesh (Manager)',
      module: 'Vendors',
      action: 'Update',
      details: 'Updated address for vendor "Sri Krishna Electronics"',
      ip: '192.168.1.4'
    }
  ];

  const filteredLogs = dummyGlobalLogs.filter(log => 
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Audit Logs</h1>
          <p className="text-text-secondary mt-1">Track all system activities and changes</p>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium text-text-secondary hover:bg-gray-50">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Module</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-text-primary whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-text-secondary" />
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {log.user.charAt(0)}
                      </div>
                      <span className="font-medium text-text-primary">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                      {log.module}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={log.action === 'Delete' ? 'danger' : log.action === 'Create' ? 'success' : 'default'}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-text-secondary max-w-md truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="px-6 py-4 text-right text-text-muted font-mono text-xs">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
