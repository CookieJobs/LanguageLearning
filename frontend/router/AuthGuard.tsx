// input: react, react-router-dom, ../contexts/AppContext
// output: AuthGuard
// pos: 前端/路由层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useApp();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
};
