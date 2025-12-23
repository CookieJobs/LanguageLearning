// input: react, react-router-dom, ../components/ReviewList, ../contexts/AppContext
// output: ReviewPage
// pos: 前端/页面层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
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
