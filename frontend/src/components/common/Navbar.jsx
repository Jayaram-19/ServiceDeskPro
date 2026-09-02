import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, User as UserIcon } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-[#d9c1a4]/70 bg-[#fffaf2]/80 backdrop-blur-xl pr-6 pl-14 md:px-6 transition-colors">
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <h1 className="text-xl font-semibold text-foreground">{title || 'ServiceDesk Pro'}</h1>
      </motion.div>

      <div className="flex items-center gap-4">
        <NotificationsDropdown />

        <div className="flex items-center gap-3 border-l border-[#d9c1a4] pl-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium leading-none text-foreground">{user?.name}</span>
            <span className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9c1a4] bg-[#eadcca] text-[#6b4226]">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
            ) : (
              <UserIcon className="h-5 w-5" />
            )}
          </div>
          <button 
            onClick={logout}
            className="ml-2 rounded-lg p-1.5 text-[#70594b] transition-colors hover:bg-[#f2e2cc] hover:text-[#8c5a3c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c5a3c]/50"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
