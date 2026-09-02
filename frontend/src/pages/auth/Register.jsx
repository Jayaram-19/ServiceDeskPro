import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-background">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold mb-4">Registration</h1>
        <p className="text-muted-foreground mb-6">
          Account registration is disabled for this demo.
        </p>
        <p className="text-sm mb-6">
          Please use the demo credentials provided on the login page to access the system.
        </p>
        <Link 
          to="/login"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default Register;
