import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, AlertCircle, Package, FileText, DollarSign, Calendar, Filter, ArrowRight } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

const StatCard = ({ title, value, subValue, icon: Icon, alert, colorClass = "bg-primary-light text-primary" }) => (
  <Card className="relative overflow-hidden">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <h3 className="text-2xl font-bold text-text-primary mt-2">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${alert ? 'bg-accent-light/30 text-accent' : colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-text-muted">{subValue}</span>
    </div>
  </Card>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const { invoices, expenses, products } = useInventory();

  // Date Filter State - Default to Today
  const today = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({
    from: today,
    to: today
  });

  // Quick Date Filters
  const setQuickFilter = (type) => {
      const now = new Date();
      let from = '';
      let to = now.toISOString().split('T')[0];

      if (type === 'today') {
          from = to;
      } else if (type === 'week') {
          const lastWeek = new Date(now);
          lastWeek.setDate(now.getDate() - 7);
          from = lastWeek.toISOString().split('T')[0];
      } else if (type === 'month') {
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          from = firstDay.toISOString().split('T')[0];
      }

      setDateRange({ from, to });
  };

  // Filter Data based on Range
  const filteredData = useMemo(() => {
    // Ensure we are comparing strings in YYYY-MM-DD format
    const sales = invoices.filter(inv => inv.date >= dateRange.from && inv.date <= dateRange.to);
    const exp = expenses.filter(e => e.date >= dateRange.from && e.date <= dateRange.to);
    return { sales, expenses: exp };
  }, [invoices, expenses, dateRange]);

  // Calculate Stats
  const totalSales = filteredData.sales.reduce((sum, inv) => sum + inv.amount, 0);
  
  // Unpaid bills in the selected period
  const unpaidInPeriod = filteredData.sales
    .filter(inv => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + (inv.dueAmount || inv.amount), 0);

  const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Low Stock is a current state, not historical, so we use global products
  const lowStockItems = products.filter(p => p.stock <= 10);

  // Prepare Chart Data
  const chartOption = useMemo(() => {
    // Group sales by date
    const salesByDate = filteredData.sales.reduce((acc, inv) => {
      acc[inv.date] = (acc[inv.date] || 0) + inv.amount;
      return acc;
    }, {});

    // Sort dates
    let labels = Object.keys(salesByDate).sort();
    let data = labels.map(date => salesByDate[date]);

    // If no data, show the selected range start date with 0
    if (labels.length === 0) {
      labels = [dateRange.from];
      data = [0];
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function (params) {
          let tooltipItem = params[0];
          return `${tooltipItem.name}<br/>${tooltipItem.marker}${tooltipItem.seriesName}: ${formatCurrency(tooltipItem.value)}`;
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
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#6B7280' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } },
        axisLabel: { 
          color: '#6B7280',
          formatter: (value) => `₹${value >= 1000 ? value/1000 + 'k' : value}` 
        }
      },
      series: [
        {
          name: 'Sales',
          type: 'bar',
          barWidth: '60%',
          data: data, 
          itemStyle: { color: '#D32F2F', borderRadius: [4, 4, 0, 0] }
        }
      ]
    };
  }, [filteredData.sales, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Overview of your store's performance</p>
        </div>
        
        {/* Date Filter & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Filters */}
          <div className="flex bg-gray-100 rounded-md p-1 gap-1">
              <button onClick={() => setQuickFilter('today')} className="px-3 py-1 text-xs font-medium rounded hover:bg-white hover:shadow-sm transition-all">Today</button>
              <button onClick={() => setQuickFilter('week')} className="px-3 py-1 text-xs font-medium rounded hover:bg-white hover:shadow-sm transition-all">Week</button>
              <button onClick={() => setQuickFilter('month')} className="px-3 py-1 text-xs font-medium rounded hover:bg-white hover:shadow-sm transition-all">Month</button>
          </div>

          <div className="flex items-center gap-2 bg-white border border-border rounded-md px-3 py-2 text-sm shadow-sm">
            <Calendar size={16} className="text-text-secondary" />
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="outline-none bg-transparent text-text-primary w-32"
              />
              <ArrowRight size={14} className="text-text-secondary" />
              <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="outline-none bg-transparent text-text-primary w-32"
              />
            </div>
          </div>
          
          <Button size="sm" icon={FileText} onClick={() => navigate('/billing')}>New Bill</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Sales" 
          value={formatCurrency(totalSales)} 
          subValue={`${filteredData.sales.length} invoices generated`}
          icon={DollarSign} 
          colorClass="bg-green-100 text-green-700"
        />
        <StatCard 
          title="Unpaid (Period)" 
          value={formatCurrency(unpaidInPeriod)} 
          subValue="Outstanding from selection"
          icon={AlertCircle} 
          alert
        />
        <StatCard 
          title="Total Expenses" 
          value={formatCurrency(totalExpenses)} 
          subValue={`${filteredData.expenses.length} transactions`}
          icon={FileText} 
          colorClass="bg-blue-100 text-blue-700"
        />
        <StatCard 
          title="Low Stock Items" 
          value={lowStockItems.length} 
          subValue="Global Alert"
          icon={Package} 
          alert
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Sales Overview" subtitle={`Revenue performance from ${dateRange.from} to ${dateRange.to}`} />
          <ReactECharts option={chartOption} style={{ height: '300px' }} />
        </Card>

        {/* Low Stock Alert Table */}
        <Card className="flex flex-col h-full">
          <CardHeader 
            title="Low Stock Alerts" 
            action={<Button variant="link" size="sm" onClick={() => navigate('/inventory')}>View All</Button>}
          />
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary bg-gray-50 uppercase">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lowStockItems.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/inventory/${item.id}`)}>
                    <td className="px-3 py-3 font-medium text-text-primary truncate max-w-[120px]" title={item.name}>{item.name}</td>
                    <td className="px-3 py-3 text-right font-bold text-red-600">{item.stock}</td>
                    <td className="px-3 py-3">
                      <Badge variant={item.stock === 0 ? 'danger' : 'warning'}>
                        {item.stock === 0 ? 'Out' : 'Low'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {lowStockItems.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-3 py-8 text-center text-text-secondary">
                      All stock levels are healthy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Recent Activity & System Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Recent Invoices (Selected Period)" />
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredData.sales.length > 0 ? (
              filteredData.sales.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <DollarSign size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{inv.customerName}</p>
                      <p className="text-xs text-text-muted">{inv.invoiceNo} • {inv.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">{formatCurrency(inv.amount)}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : inv.status === 'Partial' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-secondary text-center py-4">No sales found in this period.</p>
            )}
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
