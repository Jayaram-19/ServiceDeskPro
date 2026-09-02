import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader2, Download, BarChart3, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { StaggerContainer, AnimatedListItem } from '../../components/motion/StaggerContainer';
import { Skeleton, CardSkeleton } from '../../components/motion/SkeletonLoader';
import { motion, AnimatePresence } from 'framer-motion';

const AdminReports = () => {
  const [slaStats, setSlaStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/sla');
        setSlaStats(res.data.slaStats || []);
      } catch (err) {
        toast.error('Failed to load SLA reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = async (type) => {
    try {
      const response = await api.get(`/reports/${type}?format=csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error(`Failed to download ${type} report`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Export data and view performance metrics.</p>
        </div>
      </div>

      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <AnimatedListItem className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Tickets Report</h3>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">Complete dump of all tickets including resolution times, assignees, and SLA status.</p>
          </div>
          <button 
            onClick={() => handleDownload('tickets')}
            className="inline-flex w-full h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </button>
        </AnimatedListItem>

        <AnimatedListItem className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Assets Report</h3>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">Complete inventory dump including warranties, assignments, and statuses.</p>
          </div>
          <button 
            onClick={() => handleDownload('assets')}
            className="inline-flex w-full h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </button>
        </AnimatedListItem>
      </StaggerContainer>

      <h3 className="text-xl font-bold tracking-tight mt-8 mb-4">SLA Compliance by Priority</h3>
      
      <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton className="h-48" />
          <CardSkeleton className="h-48" />
          <CardSkeleton className="h-48" />
          <CardSkeleton className="h-48" />
        </motion.div>
      ) : slaStats.length === 0 ? (
        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 text-center text-muted-foreground bg-card rounded-xl border">
          No SLA data available yet.
        </motion.div>
      ) : (
        <StaggerContainer key="grid" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {slaStats.map(stat => (
            <AnimatedListItem key={stat._id} className="rounded-xl border bg-card text-card-foreground shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-base">{stat._id}</span>
                {stat.complianceRate >= 90 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              
              <div className="text-3xl font-bold mb-2">
                {stat.complianceRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mb-4">Compliance Rate</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Tickets</span>
                  <span className="font-medium">{stat.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compliant</span>
                  <span className="font-medium text-green-600">{stat.compliant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Breached</span>
                  <span className="font-medium text-red-600">{stat.breached}</span>
                </div>
              </div>
            </AnimatedListItem>
          ))}
        </StaggerContainer>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminReports;
