import React from 'react';
import AnimatedOutlet from '../components/motion/AnimatedOutlet';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import WorkspaceBackground from '../components/common/WorkspaceBackground';

const EmployeeLayout = () => {
  return (
    <WorkspaceBackground>
      <Sidebar role="employee" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar title="Employee Workspace" />
        <main className="flex-1 overflow-y-auto bg-transparent p-4 sm:p-6 lg:p-8">
          <AnimatedOutlet />
        </main>
      </div>
    </WorkspaceBackground>
  );
};

export default EmployeeLayout;
