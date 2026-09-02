import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';
import ManagerLayout from '../layouts/ManagerLayout';
import TechnicianLayout from '../layouts/TechnicianLayout';
import AssetManagerLayout from '../layouts/AssetManagerLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Dashboard Pages
import EmployeeDashboard from '../pages/dashboard/EmployeeDashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import ManagerDashboard from '../pages/dashboard/ManagerDashboard';
import TechnicianDashboard from '../pages/dashboard/TechnicianDashboard';
import AssetManagerDashboard from '../pages/dashboard/AssetManagerDashboard';

// Admin Pages
import AdminUsers from '../pages/admin/Users';
import AdminSettings from '../pages/admin/Settings';
import AdminReports from '../pages/admin/Reports';
import AdminAssets from '../pages/admin/Assets';
import AdminKnowledge from '../pages/admin/Knowledge';

// Ticket Pages
import TicketList from '../pages/tickets/TicketList';
import TicketDetail from '../pages/tickets/TicketDetail';

// Shared Pages
import AssetList from '../pages/shared/AssetList';
import KnowledgeBase from '../pages/shared/KnowledgeBase';
import Home from '../pages/public/Home';

import ProtectedRoute from './ProtectedRoute';

const getDashboardPath = (role) => {
  switch (role) {
    case 'admin': return '/admin';
    case 'manager': return '/manager';
    case 'technician': return '/technician';
    case 'asset_manager': return '/assets-dash';
    default: return '/employee';
  }
};

// Generic placeholder for pages still being built
const Placeholder = ({ title }) => (
  <div className="space-y-4 p-2">
    <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-10 text-center text-muted-foreground">
      <p className="text-lg">This section is under construction.</p>
      <p className="text-sm mt-2">Full functionality coming soon.</p>
    </div>
  </div>
);

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <Register />} />
      <Route path="/unauthorized" element={<div className="p-10 text-center"><h1 className="text-2xl font-bold text-destructive">403 – Unauthorized</h1><p className="mt-2 text-muted-foreground">You do not have permission to view this page.</p></div>} />

      {/* Employee Routes */}
      <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeLayout /></ProtectedRoute>}>
        <Route index element={<EmployeeDashboard />} />
        <Route path="tickets" element={<TicketList />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="assets" element={<AssetList />} />
        <Route path="knowledge" element={<KnowledgeBase />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="tickets" element={<TicketList />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="assets" element={<AdminAssets />} />
        <Route path="knowledge" element={<AdminKnowledge />} />
      </Route>

      {/* Manager Routes */}
      <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}><ManagerLayout /></ProtectedRoute>}>
        <Route index element={<ManagerDashboard />} />
        <Route path="tickets" element={<TicketList />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="assets" element={<AssetList />} />
        <Route path="knowledge" element={<KnowledgeBase />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Technician Routes */}
      <Route path="/technician" element={<ProtectedRoute allowedRoles={['technician']}><TechnicianLayout /></ProtectedRoute>}>
        <Route index element={<TechnicianDashboard />} />
        <Route path="tickets" element={<TicketList />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="knowledge" element={<KnowledgeBase />} />
      </Route>

      {/* Asset Manager Routes */}
      <Route path="/assets-dash" element={<ProtectedRoute allowedRoles={['asset_manager']}><AssetManagerLayout /></ProtectedRoute>}>
        <Route index element={<AssetManagerDashboard />} />
        <Route path="assets" element={<AssetList />} />
        <Route path="vendors" element={<Placeholder title="Vendor Management" />} />
      </Route>

      {/* Catch All */}
      <Route path="*" element={<div className="p-10 text-center"><h1 className="text-2xl font-bold">404 – Page Not Found</h1></div>} />
    </Routes>
  );
};

export default AppRoutes;
