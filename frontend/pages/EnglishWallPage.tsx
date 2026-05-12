import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EnglishWall } from '../components/EnglishWall/EnglishWall';

export const EnglishWallPage: React.FC = () => {
  return (
    <div className="h-[100dvh] bg-[#131f24] text-white flex flex-col overflow-hidden w-full">
      <EnglishWall />
    </div>
  );
};
