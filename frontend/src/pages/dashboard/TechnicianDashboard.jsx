import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader2, Ticket, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const TechnicianDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/technician');
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
      <h2 className="text-2xl font-bold tracking-tight">Technician Overview</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Assigned Tickets</h3>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.stats?.assigned ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Near SLA Breach</h3>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500">{data.stats?.slaWarning ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Resolved (7d)</h3>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.stats?.resolvedThisWeek ?? 0}</div>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/technician/tickets" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            My Tickets
          </Link>
          <Link to="/technician/knowledge" className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent">
            Knowledge Base
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
