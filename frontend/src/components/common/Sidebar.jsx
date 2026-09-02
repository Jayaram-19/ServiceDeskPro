import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Ticket, 
  BookOpen, 
  HardDrive, 
  Users, 
  Settings,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import SlideOverDrawer from '../motion/SlideOverDrawer';

const Sidebar = ({ role }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getLinks = () => {
    const links = [];

    // Base path per role
    const basePath = {
      admin: '/admin',
      manager: '/manager',
      technician: '/technician',
      asset_manager: '/assets-dash',
      employee: '/employee',
    }[role] || '/employee';

    // Dashboard link
    links.push({ to: basePath, icon: LayoutDashboard, label: 'Dashboard', end: true });

    // Tickets (all roles except asset_manager)
    if (role !== 'asset_manager') {
      links.push({ to: `${basePath}/tickets`, icon: Ticket, label: 'Tickets' });
    }

    // Assets
    if (['admin', 'asset_manager', 'manager', 'employee'].includes(role)) {
      links.push({ to: `${basePath}/assets`, icon: HardDrive, label: 'Assets' });
    }

    // Knowledge Base (not asset_manager)
    if (role !== 'asset_manager') {
      links.push({ to: `${basePath}/knowledge`, icon: BookOpen, label: 'Knowledge Base' });
    }

    // Reports for admin and manager
    if (['admin', 'manager'].includes(role)) {
      links.push({ to: `${basePath}/reports`, icon: BarChart3, label: 'Reports' });
    }

    // Admin specific
    if (role === 'admin') {
      links.push({ to: `${basePath}/users`, icon: Users, label: 'Users & Roles' });
      links.push({ to: `${basePath}/settings`, icon: Settings, label: 'Settings' });
    }

    // Asset manager specific
    if (role === 'asset_manager') {
      links.push({ to: `${basePath}/vendors`, icon: Settings, label: 'Vendors' });
    }

    return links;
  };

  const NavContent = ({ onNavigate }) => (
    <>
      <div className="flex h-16 items-center justify-center border-b border-border px-6 shrink-0">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary text-xl hover:opacity-80 transition-opacity">
          <Ticket className="h-6 w-6" />
          <span>ServiceDesk Pro</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto relative">
        {getLinks().map((link) => {
          // Check if active (considering 'end' prop logic manually for the layoutId)
          const isActive = link.end 
            ? location.pathname === link.to 
            : location.pathname.startsWith(link.to);

          return (
            <motion.div key={link.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <NavLink
                to={link.to}
                end={link.end ?? false}
                onClick={onNavigate}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors z-10",
                  isActive 
                    ? "text-primary-foreground" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-md bg-primary -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <link.icon className="h-5 w-5" />
              </motion.div>
              {link.label}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) - Placed absolute so it sits in the Navbar area if needed, 
          but usually the Navbar would have the button. For this architecture, we'll expose a floating button for mobile. */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-4 z-40 p-2 rounded-md bg-card border border-border shadow-sm text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col border-r border-border bg-card">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <SlideOverDrawer
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          direction="left"
          className="w-64"
        >
          <div className="flex flex-col h-full -m-4">
            <NavContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </SlideOverDrawer>
      </div>
    </>
  );
};

export default Sidebar;
