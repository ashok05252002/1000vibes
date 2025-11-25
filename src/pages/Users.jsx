import React from 'react';
import { faker } from '@faker-js/faker';
import { Plus, MoreVertical, Edit2, Lock, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

// Generate dummy data
const users = Array.from({ length: 8 }).map(() => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement(['Admin', 'Billing Staff', 'Inventory Manager']),
  status: faker.helpers.arrayElement(['Active', 'Inactive']),
  lastLogin: faker.date.recent().toLocaleDateString(),
}));

export const UsersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary mt-1">Manage access and roles for your team</p>
        </div>
        <Button icon={Plus}>Add New User</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Login</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{user.name}</div>
                        <div className="text-xs text-text-secondary">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'Active' ? 'success' : 'default'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-text-secondary hover:text-primary hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-text-secondary hover:text-accent hover:bg-red-50 rounded-md transition-colors" title="Deactivate">
                        <Lock size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-border bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-text-secondary">Showing 1 to 8 of 8 entries</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
