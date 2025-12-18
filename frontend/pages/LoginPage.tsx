import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Auth } from '../components/Auth';
import { useApp } from '../contexts/AppContext';
import { getMe, updateMe } from '../services/geminiService';

export const LoginPage: React.FC = () => {
  const { setToken } = useApp();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || '/';
  return (
    <Auth onAuthed={async (t)=>{
      setToken(t);
      navigate('/', { replace: true })
    }} />
  );
};

// 学段选择已移除，登录后统一进入首页
