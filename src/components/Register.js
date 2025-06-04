import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../firebase';
import { Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      await set(ref(database, `users/${userCredential.user.uid}`), {
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date().toISOString()
      });
      
    } catch (error) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>📝</h1>
          <h2>회원가입</h2>
          <p>새 계정을 만들어 가계부를 시작하세요</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">이메일 주소</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-control"
              placeholder="이메일을 입력하세요"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-control"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">전화번호</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              className="form-control"
              placeholder="전화번호를 입력하세요"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-secondary btn-full" disabled={loading}>
            {loading ? '가입 중...' : '회원가입 완료'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>이미 계정이 있으신가요?</p>
          <Link to="/login" className="auth-link">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
