// input: react, react-router-dom, ../components/Auth, ../contexts/AppContext, ../services/geminiService
// output: LoginPage
// pos: 前端/页面层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
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
