import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Loader2, MessageSquare, Clock, AlertTriangle, CheckCircle2,
  ArrowLeft, User, Tag, Building, Zap, ChevronDown, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Skeleton, CardSkeleton } from '../../components/motion/SkeletonLoader';

const getBasePath = (pathname) => '/' + pathname.split('/')[1];

const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-800',
  Assigned: 'bg-purple-100 text-purple-800',
  'In Progress': 'bg-amber-100 text-amber-800',
  Pending: 'bg-orange-100 text-orange-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-100 text-gray-600',
  Reopened: 'bg-red-100 text-red-800',
  Cancelled: 'bg-slate-100 text-slate-500',
};

const PRIORITY_COLORS = {
  Low: 'bg-slate-100 text-slate-700',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

// Allowed status transitions per role (mirrors backend)
const ALLOWED_TRANSITIONS = {
  admin:      { Open: ['Assigned','Cancelled'], Assigned: ['In Progress','Open','Cancelled'], 'In Progress': ['Pending','Resolved','Assigned'], Pending: ['In Progress','Resolved','Cancelled'], Resolved: ['Closed','Reopened'], Closed: [], Reopened: ['In Progress'], Cancelled: [] },
  manager:    { Open: ['Assigned','Cancelled'], Assigned: ['In Progress','Open','Cancelled'], 'In Progress': ['Pending','Resolved','Assigned'], Pending: ['In Progress','Resolved','Cancelled'], Resolved: ['Closed','Reopened'], Closed: [], Reopened: ['In Progress'], Cancelled: [] },
  technician: { Assigned: ['In Progress'], 'In Progress': ['Pending','Resolved'], Pending: ['In Progress','Resolved'], Resolved: [], Closed: [], Reopened: ['In Progress'], Cancelled: [], Open: [] },
  employee:   { Resolved: ['Reopened'], Reopened: [], Closed: [], Open: [], Assigned: [], 'In Progress': [], Pending: [], Cancelled: [] },
};

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = getBasePath(location.pathname);

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [technicians, setTechnicians] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`),
      ]);
      setTicket(ticketRes.data.ticket);
      setComments(commentsRes.data.comments || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    if (['admin', 'manager'].includes(user?.role)) {
      api.get('/users/technicians').then(r => setTechnicians(r.data.technicians || [])).catch(() => {});
    }
  }, [fetchData, user?.role]);

  const containerRef = React.useRef(null);
  
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.gsap-reveal', {
          y: 20,
          opacity: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, ticket]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/tickets/${id}/comments`, { message: newComment, isInternal });
      setComments(prev => [...prev, res.data.comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.patch(`/tickets/${id}`, { status: newStatus });
      setTicket(res.data.ticket);
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssign = async (techId) => {
    try {
      const res = await api.post(`/tickets/${id}/assign`, { assignedTo: techId });
      setTicket(res.data.ticket);
      toast.success('Ticket assigned');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign ticket');
    }
  };

  if (loading) return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
  if (!ticket) return (
    <div className="p-10 text-center text-muted-foreground">Ticket not found or access denied.</div>
  );

  const allowedStatuses = ALLOWED_TRANSITIONS[user?.role]?.[ticket.status] || [];
  const canAssign = ['admin', 'manager'].includes(user?.role);
  const canComment = true;

  const slaRemaining = ticket.slaDeadline
    ? Math.max(0, new Date(ticket.slaDeadline) - Date.now())
    : null;
  const slaHoursLeft = slaRemaining !== null ? (slaRemaining / 3600000).toFixed(1) : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto" ref={containerRef}>
      {/* Breadcrumb / back */}
      <div className="gsap-reveal flex items-center gap-2 text-sm text-muted-foreground">
        <Link to={`${basePath}/tickets`} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Tickets
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{ticket.ticketId}</span>
      </div>

      {/* Header */}
      <div className="gsap-reveal flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold tracking-tight leading-tight">{ticket.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Created by <strong>{ticket.requester?.name}</strong> on {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[ticket.status] || 'bg-secondary'}`}>
            {ticket.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLORS[ticket.priority] || 'bg-secondary'}`}>
            {ticket.priority}
          </span>
          {ticket.slaBreached && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> SLA Breached
            </span>
          )}
        </div>
      </div>

      {/* Status Actions */}
      {allowedStatuses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allowedStatuses.map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium border transition-colors hover:opacity-80 ${STATUS_COLORS[s] || 'border-input bg-secondary'}`}
            >
              → {s}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Description + Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="gsap-reveal rounded-xl border bg-card shadow-sm p-6">
            <h3 className="font-semibold mb-3 text-base border-b pb-2">Description</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{ticket.description}</p>
          </div>

          {/* AI Analysis */}
          {ticket.aiClassification?.probableIssue && (
            <div className="gsap-reveal rounded-xl border border-primary/20 bg-primary/5 shadow-sm p-6">
              <h3 className="font-semibold text-primary flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4" /> AI Analysis
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Probable Issue</span>
                  <span className="font-medium">{ticket.aiClassification.probableIssue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Suggested Priority</span>
                  <span className="font-medium">{ticket.aiClassification.priority}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Suggested Category</span>
                  <span className="font-medium">{ticket.aiClassification.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Confidence</span>
                  <span className="font-medium">{Math.round((ticket.aiClassification.confidence || 0) * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="gsap-reveal rounded-xl border bg-card shadow-sm p-6">
            <h3 className="font-semibold mb-4 text-base border-b pb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Comments ({comments.length})
            </h3>
            <div className="space-y-4 mb-5 max-h-[450px] overflow-y-auto pr-1">
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment.</p>
              )}
              <AnimatePresence initial={false}>
                {comments.map(c => {
                  const isCurrentUser = c.author?._id === user?._id;
                  const slideInX = isCurrentUser ? 20 : -20;
                  return (
                    <motion.div
                      key={c._id}
                      initial={{ opacity: 0, x: slideInX, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`p-4 rounded-lg border text-sm ${c.isInternal ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20' : 'bg-muted/30 border-border'} ${isCurrentUser ? 'ml-8' : 'mr-8'}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.author?.name || 'Unknown'}</span>
                      {c.isInternal && (
                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Internal Note</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{c.message}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

            {canComment && (
              <form onSubmit={handleAddComment} className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
                <div className="flex items-center justify-between">
                  {['admin', 'manager', 'technician'].includes(user?.role) && (
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={e => setIsInternal(e.target.checked)}
                        className="rounded"
                      />
                      Internal note (hidden from employee)
                    </label>
                  )}
                  <div className="ml-auto">
                    <button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5 mr-1.5" />Send</>}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right: Metadata Panel */}
        <div className="space-y-6">
          <div className="gsap-reveal rounded-xl border bg-card shadow-sm p-6 space-y-6">
            <h3 className="font-semibold border-b pb-2">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-xs">Category</span>
                  <span className="font-medium">{ticket.category?.name || 'Uncategorised'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-xs">Department</span>
                  <span className="font-medium">{ticket.department?.name || '—'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-xs">Assigned To</span>
                  <span className="font-medium">{ticket.assignedTo?.name || <span className="italic text-muted-foreground">Unassigned</span>}</span>
                </div>
              </div>
            </div>

            {/* Assign Dropdown (manager/admin) */}
            {canAssign && technicians.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Assign to Technician</label>
                <select
                  defaultValue=""
                  onChange={e => e.target.value && handleAssign(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">— Select Technician —</option>
                  {technicians.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* SLA Card */}
          {ticket.slaDeadline && (
            <div className={`gsap-reveal rounded-xl border shadow-sm p-5 ${ticket.slaBreached ? 'border-destructive/50 bg-destructive/5' : 'bg-card'}`}>
              <h3 className="font-semibold border-b pb-2 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" /> SLA Status
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="font-medium">{new Date(ticket.slaDeadline).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {ticket.slaBreached ? (
                    <span className="text-destructive font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Breached
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {slaHoursLeft < 2 ? 'At Risk' : 'On Track'} ({slaHoursLeft}h left)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          {ticket.history?.length > 0 && (
            <div className="rounded-xl border bg-card shadow-sm p-5">
              <h3 className="font-semibold border-b pb-2 mb-3">Activity Timeline</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {[...ticket.history].reverse().map((h, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="font-medium">{h.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.performedBy?.name || 'System'} · {new Date(h.timestamp).toLocaleString()}
                      </p>
                      {h.oldValue && h.newValue && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {h.oldValue} → {h.newValue}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
