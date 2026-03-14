/**
 * PROFILE PAGE — Glass card design with user info
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
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Manage your account settings</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid var(--divider)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
            <span className="text-2xl font-bold text-white">
              {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{currentUser.name}</h2>
            <div className="flex items-center gap-1 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              <Shield size={13} />
              {currentUser.role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><User size={12} /> Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-sm glass-input ${errors.name ? 'border-red-400/50' : ''}`} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Mail size={12} /> Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-sm glass-input ${errors.email ? 'border-red-400/50' : ''}`} />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Role</label>
            <input type="text" value={currentUser.role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff'}
              readOnly className="w-full px-4 py-2.5 rounded-xl text-sm glass-input opacity-60" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Member Since</label>
            <input type="text" value={new Date(currentUser.createdAt).toLocaleDateString()}
              readOnly className="w-full px-4 py-2.5 rounded-xl text-sm glass-input opacity-60" />
          </div>
          <div className="pt-2">
            <button type="submit" className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${saved ? 'btn-success' : 'btn-primary'}`}>
              {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold text-[14px] mb-4" style={{ color: 'var(--text-primary)' }}>Account Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl p-3" style={{ background: 'var(--surface)' }}>
            <div className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>User ID</div>
            <div className="font-mono text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>{currentUser.id}</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--surface)' }}>
            <div className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Access Level</div>
            <div className="font-medium mt-1" style={{ color: 'var(--text-primary)' }}>Full Access</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
