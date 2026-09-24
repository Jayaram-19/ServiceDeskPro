import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Ticket, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StaggerContainer, AnimatedListItem } from '../../components/motion/StaggerContainer';
import { Skeleton } from '../../components/motion/SkeletonLoader';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const recentTicketsRef = React.useRef(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/employee');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!loading && recentTicketsRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(recentTicketsRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
          delay: 0.1
        });
      }, recentTicketsRef);
      return () => ctx.revert();
    }
  }, [loading]);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
  if (!data) return <div>Failed to load dashboard data</div>;

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold tracking-tight">Organization Overview</h2>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link 
            to="/employee/tickets" 
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            View All Tickets
          </Link>
        </motion.div>
      </motion.div>
      
      <StaggerContainer className="grid gap-4 md:grid-cols-3">
        <AnimatedListItem className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Open Tickets</h3>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.stats?.open ?? data.myOpenTickets ?? 0}</div>
        </AnimatedListItem>
        <AnimatedListItem className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pending</h3>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.stats?.pending ?? 0}</div>
        </AnimatedListItem>
        <AnimatedListItem className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Resolved</h3>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.stats?.resolved ?? data.myResolvedTickets ?? 0}</div>
        </AnimatedListItem>
      </StaggerContainer>

      <div ref={recentTicketsRef} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Tickets</h3>
        {data.recentTickets?.length > 0 ? (
          <div className="space-y-4">
            {data.recentTickets.map(ticket => (
              <div key={ticket._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <Link to={`/employee/tickets/${ticket._id}`} className="font-medium hover:underline text-primary">
                    {ticket.ticketId}: {ticket.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">Status: {ticket.status} | Requester: {ticket.requester?.name || '—'} | Created: {new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent tickets.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
