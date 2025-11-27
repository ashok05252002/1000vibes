import React from 'react';
import ReactECharts from 'echarts-for-react';
import { ArrowUpRight, ArrowDownRight, AlertCircle, Package, FileText, DollarSign } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';

const StatCard = ({ title, value, trend, trendValue, icon: Icon, alert }) => (
  <Card className="relative overflow-hidden">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <h3 className="text-2xl font-bold text-text-primary mt-2">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${alert ? 'bg-accent-light/30 text-accent' : 'bg-primary-light text-primary'}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      {trend === 'up' ? (
        <span className="text-green-600 flex items-center font-medium">
          <ArrowUpRight size={16} className="mr-1" /> {trendValue}
        </span>
      ) : (
        <span className="text-accent flex items-center font-medium">
          <ArrowDownRight size={16} className="mr-1" /> {trendValue}
        </span>
      )}
      <span className="text-text-muted ml-2">vs last month</span>
    </div>
  </Card>
);

export const Dashboard = () => {
  // Chart Configuration
  const chartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params) {
        let tooltipItem = params[0];
        // Simple formatter to add INR symbol in tooltip
        return `${tooltipItem.name}<br/>${tooltipItem.marker}${tooltipItem.seriesName}: ₹${tooltipItem.value.toLocaleString('en-IN')}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#6B7280' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } },
      axisLabel: { 
        color: '#6B7280',
        formatter: (value) => `₹${value/1000}k` 
      }
    },
    series: [
      {
        name: 'Sales',
        type: 'bar',
        barWidth: '60%',
        data: [12000, 19000, 15000, 28000, 22000, 31000, 25000], 
        itemStyle: { color: '#D32F2F', borderRadius: [4, 4, 0, 0] } // Updated to Red
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Overview of your store's performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm">Export Report</Button>
          <Button size="sm" icon={FileText}>New Bill</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Sales" 
          value={formatCurrency(245000)} 
          trend="up" 
          trendValue="12.5%" 
          icon={DollarSign} 
        />
        <StatCard 
          title="Unpaid Bills" 
          value={formatCurrency(12500)} 
          trend="down" 
          trendValue="4.2%" 
          icon={AlertCircle} 
          alert
        />
        <StatCard 
          title="Total Expenses" 
          value={formatCurrency(34000)} 
          trend="up" 
          trendValue="8.1%" 
          icon={FileText} 
        />
        <StatCard 
          title="Low Stock Items" 
          value="12" 
          trend="up" 
          trendValue="2" 
          icon={Package} 
          alert
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Weekly Sales Overview" subtitle="Revenue performance for the current week" />
          <ReactECharts option={chartOption} style={{ height: '300px' }} />
        </Card>

        {/* Low Stock Alert Table */}
        <Card>
          <CardHeader 
            title="Low Stock Alerts" 
            action={<Button variant="link" size="sm">View All</Button>}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary bg-gray-50 uppercase">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: 'Wireless Mouse', qty: 2, status: 'Critical' },
                  { name: 'USB-C Cable', qty: 5, status: 'Low' },
                  { name: 'Monitor Stand', qty: 3, status: 'Critical' },
                  { name: 'Keyboard K2', qty: 8, status: 'Low' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium text-text-primary">{item.name}</td>
                    <td className="px-3 py-3 text-right">{item.qty}</td>
                    <td className="px-3 py-3">
                      <Badge variant={item.status === 'Critical' ? 'danger' : 'warning'}>
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Recent Activity & System Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Recent Activity" />
          <div className="space-y-4">
            {[
              { user: 'Rajesh Kumar', action: 'created a new invoice', time: '10 mins ago', id: '#INV-2024' },
              { user: 'Priya Singh', action: 'updated stock for', time: '1 hour ago', id: 'MacBook Pro' },
              { user: 'Admin', action: 'approved expense report', time: '2 hours ago', id: '#EXP-99' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-text-secondary">
                  {log.user.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{log.user}</span> {log.action} <span className="font-medium">{log.id}</span>
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="System Messages" />
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
              <h4 className="text-sm font-semibold text-blue-800">System Maintenance</h4>
              <p className="text-xs text-blue-600 mt-1">Scheduled maintenance on Sunday at 2:00 AM IST.</p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
              <h4 className="text-sm font-semibold text-yellow-800">Pending Approvals</h4>
              <p className="text-xs text-yellow-600 mt-1">3 expense reports require your approval.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
