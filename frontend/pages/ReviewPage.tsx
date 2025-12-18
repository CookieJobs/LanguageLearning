import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewList } from '../components/ReviewList';
import { useApp } from '../contexts/AppContext';

export const ReviewPage: React.FC = () => {
  const { masteredItems } = useApp();
  const navigate = useNavigate();
  return (
    <ReviewList items={masteredItems} onBack={async () => { navigate(-1); }} />
  );
};
