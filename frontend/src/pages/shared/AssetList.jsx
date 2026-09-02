import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader2, Search, Plus, Laptop, Server, Smartphone, Key, Monitor, Wifi, HardDrive, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { StaggerContainer, AnimatedTableRow } from '../../components/motion/StaggerContainer';
import { TableSkeleton } from '../../components/motion/SkeletonLoader';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_COLORS = {
  Available: 'bg-green-100 text-green-800',
  Assigned: 'bg-blue-100 text-blue-800',
  'Under Repair': 'bg-amber-100 text-amber-800',
  Retired: 'bg-slate-100 text-slate-800',
  Disposed: 'bg-red-100 text-red-800',
  Procured: 'bg-purple-100 text-purple-800',
};

const getAssetIcon = (type, category) => {
  if (type === 'Software' || category === 'License') return <Key className="h-5 w-5" />;
  if (type === 'Network') return <Wifi className="h-5 w-5" />;
  if (category === 'Server') return <Server className="h-5 w-5" />;
  if (category === 'Mobile') return <Smartphone className="h-5 w-5" />;
  if (category === 'Monitor') return <Monitor className="h-5 w-5" />;
  if (category === 'Storage') return <HardDrive className="h-5 w-5" />;
  if (category === 'Laptop' || category === 'Desktop') return <Laptop className="h-5 w-5" />;
  return <Tag className="h-5 w-5" />;
};

const AssetList = ({ title = "Assets", hideActions = false }) => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await api.get('/assets');
        setAssets(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load assets');
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    (a.serialNumber && a.serialNumber.toLowerCase().includes(search.toLowerCase())) ||
    a.assetId.toLowerCase().includes(search.toLowerCase())
  );

  const canManage = ['admin', 'asset_manager'].includes(user?.role);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === 'employee' ? 'Hardware and software assigned to you.' : 'Manage hardware, software, and licenses.'}
          </p>
        </div>
        {canManage && !hideActions && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Add Asset
            </button>
          </motion.div>
        )}
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 border-b flex gap-4 bg-muted/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, serial, or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TableSkeleton columns={canManage ? 5 : 4} rows={5} />
          </motion.div>
        ) : filteredAssets.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 text-center text-muted-foreground">
            No assets found.
          </motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium">Type / Category</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Assigned To</th>
                  {canManage && <th className="px-6 py-4 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <StaggerContainer as="tbody">
                {filteredAssets.map(asset => (
                  <AnimatedTableRow key={asset._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg border bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0">
                          {getAssetIcon(asset.assetType, asset.category)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{asset.name}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">{asset.assetId} {asset.serialNumber ? `· ${asset.serialNumber}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{asset.category || '—'}</div>
                      <div className="text-xs text-muted-foreground">{asset.assetType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[asset.status] || 'bg-secondary'}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {asset.assignedTo?.name || '—'}
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:underline text-sm font-medium">Edit</button>
                      </td>
                    )}
                  </AnimatedTableRow>
                ))}
              </StaggerContainer>
            </table>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AssetList;
