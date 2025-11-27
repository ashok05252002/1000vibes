import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import { Plus, MoreVertical, Edit2, Lock, Trash2, Shield, Check, Users as UsersIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useInventory, PERMISSIONS_LIST } from '../context/InventoryContext';

export const UsersPage = () => {
  const { users, roles, addRole, addUser } = useInventory();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'roles'
  
  // --- User Modal State ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '', roleId: '', password: '' });

  // --- Role Modal State ---
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleData, setRoleData] = useState({ name: '', permissions: [] });

  // --- Handlers: Users ---
  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!userData.name || !userData.email || !userData.roleId) return;

    const selectedRole = roles.find(r => r.id === userData.roleId);
    const newUser = {
      id: faker.string.uuid(),
      name: userData.name,
      email: userData.email,
      roleId: userData.roleId,
      roleName: selectedRole?.name || 'Unknown',
      status: 'Active',
      lastLogin: 'Never'
    };

    addUser(newUser);
    setIsUserModalOpen(false);
    setUserData({ name: '', email: '', roleId: '', password: '' });
  };

  // --- Handlers: Roles ---
  const togglePermission = (permId) => {
    setRoleData(prev => {
      const exists = prev.permissions.includes(permId);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permId] };
      }
    });
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (!roleData.name) return;

    const newRole = {
      id: faker.string.uuid(),
      name: roleData.name,
      permissions: roleData.permissions,
      isSystem: false
    };

    addRole(newRole);
    setIsRoleModalOpen(false);
    setRoleData({ name: '', permissions: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary mt-1">Manage system access, roles, and permissions</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'users' ? (
            <Button icon={Plus} onClick={() => setIsUserModalOpen(true)}>Add New User</Button>
          ) : (
            <Button icon={Plus} onClick={() => setIsRoleModalOpen(true)}>Create New Role</Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'users' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <UsersIcon size={16} />
            System Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'roles' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Shield size={16} />
            Roles & Permissions
          </button>
        </div>
      </div>

      {/* Content: Users Table */}
      {activeTab === 'users' && (
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {user.roleName}
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
        </Card>
      )}

      {/* Content: Roles Grid */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-text-primary">{role.name}</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    {role.isSystem ? 'System Default' : 'Custom Role'}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded-md text-text-secondary">
                  <Shield size={20} />
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 5).map(perm => (
                    <span key={perm} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                      {PERMISSIONS_LIST.find(p => p.id === perm)?.label || perm}
                    </span>
                  ))}
                  {role.permissions.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded border border-gray-200">
                      +{role.permissions.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-end gap-2">
                {!role.isSystem && (
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    Delete
                  </Button>
                )}
                <Button variant="secondary" size="sm">Edit Permissions</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Add User */}
      <Modal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Full Name *</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
              value={userData.name}
              onChange={e => setUserData({...userData, name: e.target.value})}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email Address *</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
              value={userData.email}
              onChange={e => setUserData({...userData, email: e.target.value})}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Assign Role *</label>
            <select 
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
              value={userData.roleId}
              onChange={e => setUserData({...userData, roleId: e.target.value})}
              required
            >
              <option value="">Select a Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            <p className="text-xs text-text-secondary mt-1">
              Permissions are inherited from the selected role.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Temporary Password *</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
              value={userData.password}
              onChange={e => setUserData({...userData, password: e.target.value})}
              required 
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Role */}
      <Modal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)}
        title="Create New Role"
        className="max-w-2xl"
      >
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Role Name *</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
              placeholder="e.g. Senior Accountant"
              value={roleData.name}
              onChange={e => setRoleData({...roleData, name: e.target.value})}
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">Access Permissions</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
              {PERMISSIONS_LIST.map(perm => (
                <label 
                  key={perm.id} 
                  className={`flex items-center p-3 rounded-md border cursor-pointer transition-all ${
                    roleData.permissions.includes(perm.id) 
                      ? 'bg-primary-light border-primary text-primary' 
                      : 'bg-white border-border hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${
                    roleData.permissions.includes(perm.id) ? 'bg-primary border-primary' : 'border-gray-400'
                  }`}>
                    {roleData.permissions.includes(perm.id) && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm font-medium">{perm.label}</span>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={roleData.permissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsRoleModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Role</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
