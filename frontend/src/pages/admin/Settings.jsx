import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader2, Settings, Tag, Clock, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [categories, setCategories] = useState([]);
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fake org settings for demo purposes
  const [orgSettings, setOrgSettings] = useState({
    ticketPrefix: 'TKT',
    allowEmployeeReopening: true,
    autoCloseAfterDays: 7,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [catRes, slaRes] = await Promise.all([
          api.get('/admin/categories'),
          api.get('/admin/sla-policies')
        ]);
        setCategories(catRes.data.categories || []);
        setSlas(slaRes.data.policies || []);
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveOrgSettings = (e) => {
    e.preventDefault();
    toast.success('Organization settings saved');
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" /> Platform Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Configure your ServiceDesk Pro environment.</p>
      </div>

      {/* Organization Settings */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Organization Preferences</h3>
        <form onSubmit={handleSaveOrgSettings} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Ticket ID Prefix</label>
              <input 
                type="text" 
                value={orgSettings.ticketPrefix}
                onChange={e => setOrgSettings({...orgSettings, ticketPrefix: e.target.value})}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Auto-close resolved tickets after (days)</label>
              <input 
                type="number" 
                value={orgSettings.autoCloseAfterDays}
                onChange={e => setOrgSettings({...orgSettings, autoCloseAfterDays: e.target.value})}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="reopen"
              checked={orgSettings.allowEmployeeReopening}
              onChange={e => setOrgSettings({...orgSettings, allowEmployeeReopening: e.target.checked})}
              className="rounded border-input accent-primary"
            />
            <label htmlFor="reopen" className="text-sm cursor-pointer select-none">Allow employees to reopen resolved tickets</label>
          </div>
          <div className="pt-2">
            <button type="submit" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> Save Preferences
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Categories */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-muted/20">
            <h3 className="font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" /> Ticket Categories
            </h3>
            <button className="text-xs flex items-center text-primary hover:underline font-medium">
              <Plus className="h-3 w-3 mr-1" /> Add
            </button>
          </div>
          <div className="p-0 flex-1">
            <ul className="divide-y">
              {categories.map(c => (
                <li key={c._id} className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.description}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </li>
              ))}
              {categories.length === 0 && <li className="p-4 text-center text-sm text-muted-foreground">No categories defined.</li>}
            </ul>
          </div>
        </div>

        {/* SLA Policies */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-muted/20">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" /> SLA Policies
            </h3>
            <button className="text-xs flex items-center text-primary hover:underline font-medium">
              <Plus className="h-3 w-3 mr-1" /> Add
            </button>
          </div>
          <div className="p-0 flex-1">
            <ul className="divide-y">
              {slas.map(sla => (
                <li key={sla._id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-sm">{sla.name} <span className="text-xs font-normal text-muted-foreground ml-1">({sla.priority})</span></div>
                    {sla.businessHours?.enabled && (
                      <span className="text-[10px] uppercase tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Business Hrs</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-4 mt-2">
                    <span><strong className="text-foreground font-medium">Response:</strong> {sla.responseTimeMinutes}m</span>
                    <span><strong className="text-foreground font-medium">Resolution:</strong> {sla.resolutionTimeMinutes}m</span>
                  </div>
                </li>
              ))}
              {slas.length === 0 && <li className="p-4 text-center text-sm text-muted-foreground">No SLA policies defined.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
