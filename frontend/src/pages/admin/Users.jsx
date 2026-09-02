import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader2, Search, Plus, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { StaggerContainer, AnimatedTableRow } from '../../components/motion/StaggerContainer';
import { TableSkeleton } from '../../components/motion/SkeletonLoader';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-purple-100 text-purple-800',
  technician: 'bg-blue-100 text-blue-800',
  asset_manager: 'bg-indigo-100 text-indigo-800',
  employee: 'bg-green-100 text-green-800',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage all personnel and their access roles.</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </button>
        </motion.div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 border-b flex gap-4 bg-muted/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, email, or role..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TableSkeleton columns={5} rows={5} />
          </motion.div>
        ) : filteredUsers.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 text-center text-muted-foreground">
            No users found.
          </motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <StaggerContainer as="tbody">
                {filteredUsers.map(user => (
                  <AnimatedTableRow key={user._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <span className="font-semibold text-sm">{user.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[user.role] || 'bg-secondary'}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {user.department?.name || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:underline text-sm font-medium">Edit</button>
                    </td>
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

export default AdminUsers;
