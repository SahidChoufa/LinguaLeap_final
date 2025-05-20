import React from 'react';
import Logo from '@/components/app/logo';

const AppHeader: React.FC = () => {
  return (
    <header className="py-4 md:py-6 bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-center md:justify-start px-4 sm:px-6 lg:px-8">
        <Logo />
      </div>
    </header>
  );
};

export default AppHeader;
