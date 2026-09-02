import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader2, Ticket, CheckCircle2, Clock, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StaggerContainer, AnimatedListItem } from '../../components/motion/StaggerContainer';
import { Skeleton } from '../../components/motion/SkeletonLoader';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
  if (!data) return <div>Failed to load dashboard data</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Admin Overview</h2>
      
      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedListItem className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Tickets</h3>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-primary">{data.tickets?.reduce((acc, curr) => acc + curr.count, 0) || 0}</div>
        </AnimatedListItem>
        
        <AnimatedListItem className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Users</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-primary">{data.users?.reduce((acc, curr) => acc + curr.count, 0) || 0}</div>
        </AnimatedListItem>
      </StaggerContainer>

      <StaggerContainer className="grid gap-4 md:grid-cols-2">
        <AnimatedListItem className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Tickets by Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.tickets || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" />
                <YAxis allowDecimals={false} />
                <Tooltip itemStyle={{ color: '#6b4226' }} />
                <Bar dataKey="count" fill="#6b4226" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimatedListItem>

        <AnimatedListItem className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden">
          <h3 className="text-lg font-semibold mb-4">Recent System Activity</h3>
          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
            {data.recentAuditLogs?.map((log, i) => (
              <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">
                    by {log.performedBy?.name || 'System'} on {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedListItem>
      </StaggerContainer>
    </div>
  );
};

export default AdminDashboard;
