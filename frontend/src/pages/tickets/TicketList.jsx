import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { Loader2, Plus, Search, X, AlertTriangle, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { StaggerContainer, AnimatedTableRow } from '../../components/motion/StaggerContainer';
import { TableSkeleton } from '../../components/motion/SkeletonLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Derive the base route path from the current URL so detail links always resolve correctly
const getBasePath = (pathname) => {
  const segments = pathname.split('/');
  // e.g. /admin/tickets -> /admin  |  /employee/tickets -> /employee
  return '/' + segments[1];
};

const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-800',
  Assigned: 'bg-purple-100 text-purple-800',
  'In Progress': 'bg-amber-100 text-amber-800',
  Pending: 'bg-orange-100 text-orange-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-100 text-gray-800',
  Reopened: 'bg-red-100 text-red-800',
  Cancelled: 'bg-slate-100 text-slate-500',
};

const PRIORITY_COLORS = {
  Low: 'bg-slate-100 text-slate-700',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

// ─── Create Ticket Modal ─────────────────────────────────────────────────────
const CreateTicketModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', category: '' });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/categories').then(r => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/tickets', form);
      toast.success(`Ticket ${res.data.ticket.ticketId} created!`);
      onCreated(res.data.ticket);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border bg-card shadow-2xl p-6 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Create New Ticket</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Title <span className="text-destructive">*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Brief summary of the issue"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description <span className="text-destructive">*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the issue in detail..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Select --</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main TicketList Component ────────────────────────────────────────────────
const TicketList = () => {
  const { user } = useAuth();
  const location = useLocation();
  const basePath = getBasePath(location.pathname);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await api.get('/tickets', { params });
      setTickets(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleTicketCreated = (newTicket) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  const isEmployee = user?.role === 'employee';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <AnimatePresence>
        {showCreate && (
          <CreateTicketModal 
            onClose={() => setShowCreate(false)} 
            onCreated={handleTicketCreated} 
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tickets</h2>
          <p className="text-sm text-muted-foreground mt-1">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found</p>
        </div>
        {['employee', 'admin', 'manager'].includes(user?.role) && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Ticket
            </button>
          </motion.div>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-wrap gap-3 bg-muted/20">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Statuses</option>
            {['Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Reopened', 'Cancelled'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Priorities</option>
            {['Low', 'Medium', 'High', 'Critical'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TableSkeleton columns={isEmployee ? 6 : 7} rows={5} />
            </motion.div>
          ) : tickets.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-muted-foreground text-lg">No tickets found.</p>
            {isEmployee && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" /> Create your first ticket
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  {!isEmployee && <th className="px-4 py-3 font-medium">Requester</th>}
                  <th className="px-4 py-3 font-medium">Assigned To</th>
                  <th className="px-4 py-3 font-medium">SLA</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <StaggerContainer as="tbody">
                {tickets.map(ticket => (
                  <AnimatedTableRow key={ticket._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono font-medium">
                      <Link
                        to={`${basePath}/tickets/${ticket._id}`}
                        className="text-primary hover:underline"
                      >
                        {ticket.ticketId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <Link
                        to={`${basePath}/tickets/${ticket._id}`}
                        className="block truncate hover:text-primary transition-colors"
                        title={ticket.title}
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status] || 'bg-secondary'}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || 'bg-secondary'}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    {!isEmployee && <td className="px-4 py-3 text-muted-foreground">{ticket.requester?.name || '—'}</td>}
                    <td className="px-4 py-3 text-muted-foreground">{ticket.assignedTo?.name || <span className="italic text-xs">Unassigned</span>}</td>
                    <td className="px-4 py-3">
                      {ticket.slaBreached ? (
                        <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                          <AlertTriangle className="h-3 w-3" /> Breached
                        </span>
                      ) : ticket.slaDeadline ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(ticket.slaDeadline) < new Date(Date.now() + 2 * 3600000)
                            ? <span className="text-amber-600 font-medium">At Risk</span>
                            : 'On Track'}
                        </span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  </AnimatedTableRow>
                ))}
              </StaggerContainer>
            </table>
          </div>
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TicketList;
