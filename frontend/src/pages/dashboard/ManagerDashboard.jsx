import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader2, Ticket, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/manager');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;
  if (!data) return <div className="p-10 text-center">Failed to load dashboard data</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Manager Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Tickets</h3>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.stats?.totalTickets ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Open Tickets</h3>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.stats?.openTickets ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">SLA Breaches</h3>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold text-destructive">{data.stats?.slaBreached ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">SLA Compliance</h3>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.stats?.slaComplianceRate ?? 100}%</div>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/manager/tickets" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            View All Tickets
          </Link>
          <Link to="/manager/reports" className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent">
            View Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
