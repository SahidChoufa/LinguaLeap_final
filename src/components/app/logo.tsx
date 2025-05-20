import { Merge } from 'lucide-react';
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2" aria-label="LinguaLeap Logo">
      <Merge className="h-8 w-8 text-primary" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-primary">LinguaLeap</h1>
    </div>
  );
};

export default Logo;
