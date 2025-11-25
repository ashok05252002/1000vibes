import React from 'react';
import { Plus, Folder, Tag } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const MasterList = ({ title, icon: Icon, items }) => (
  <Card className="h-full">
    <CardHeader 
      title={title} 
      action={<Button size="sm" variant="ghost" icon={Plus}>Add</Button>}
    />
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-transparent hover:border-border transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded border border-border text-text-secondary">
              <Icon size={16} />
            </div>
            <span className="text-sm font-medium text-text-primary">{item.name}</span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button className="text-xs text-primary hover:underline">Edit</button>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export const MastersPage = () => {
  const categories = [
    { name: 'Electronics' },
    { name: 'Furniture' },
    { name: 'Stationery' },
    { name: 'Accessories' },
  ];

  const expenseTypes = [
    { name: 'Rent' },
    { name: 'Electricity' },
    { name: 'Travel' },
    { name: 'Maintenance' },
    { name: 'Office Supplies' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Masters Configuration</h1>
        <p className="text-text-secondary mt-1">Manage product categories and expense types</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MasterList title="Product Categories" icon={Folder} items={categories} />
        <MasterList title="Expense Categories" icon={Tag} items={expenseTypes} />
      </div>
    </div>
  );
};
