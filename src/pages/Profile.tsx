/**
 * PROFILE PAGE
 * Shows and allows editing of the current user's profile information.
 */
import React, { useState } from 'react';
import { User, Mail, Shield, Save, CheckCircle } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';

const Profile: React.FC = () => {
  const { currentUser, updateProfile } = useInventoryStore();
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    updateProfile({ name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-emerald-600">
              {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Shield size={14} />
              {currentUser.role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><User size={14} /> Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.name ? 'border-red-400' : 'border-slate-200'}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Mail size={14} /> Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.email ? 'border-red-400' : 'border-slate-200'}`} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <input type="text" value={currentUser.role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff'}
              readOnly className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Member Since</label>
            <input type="text" value={new Date(currentUser.createdAt).toLocaleDateString()}
              readOnly className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500" />
          </div>
          <div className="pt-2">
            <button type="submit" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 font-medium text-sm transition-colors">
              {saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-slate-500">User ID</div>
            <div className="font-mono text-xs text-slate-700 mt-1">{currentUser.id}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-slate-500">Access Level</div>
            <div className="font-medium text-slate-700 mt-1">Full Access</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
