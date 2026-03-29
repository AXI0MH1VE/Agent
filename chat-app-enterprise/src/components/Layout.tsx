import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-nexus-glow text-slate-100 font-inter">
      {children}
    </div>
  );
};

export default Layout;
