import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader2, HardDrive, CheckCircle2, AlertTriangle, ArchiveX } from 'lucide-react';
import { Link } from 'react-router-dom';

const AssetManagerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/assets');
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
      <h2 className="text-2xl font-bold tracking-tight">Asset Manager Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Assets</h3>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.stats?.total ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Available</h3>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.stats?.available ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Expiring Warranties</h3>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500">{data.expiringWarranties?.length ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Retired</h3>
            <ArchiveX className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.stats?.retired ?? 0}</div>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/assets-dash/assets" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Manage Assets
          </Link>
          <Link to="/assets-dash/vendors" className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent">
            Vendors
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssetManagerDashboard;
