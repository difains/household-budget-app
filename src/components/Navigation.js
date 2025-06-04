import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <span className="brand-icon">💰</span>
        <span className="brand-text">가계부</span>
      </div>
      
      <div className="nav-links">
        <Link 
          to="/dashboard" 
          className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <span className="nav-icon">📊</span>
          <span>대시보드</span>
        </Link>
        <Link 
          to="/calendar" 
          className={`nav-link ${location.pathname === '/calendar' ? 'active' : ''}`}
        >
          <span className="nav-icon">📅</span>
          <span>가계부</span>
        </Link>
      </div>
      
      <button onClick={handleLogout} className="logout-btn">
        <span className="logout-icon">🚪</span>
        <span>로그아웃</span>
      </button>
    </nav>
  );
};

export default Navigation;
