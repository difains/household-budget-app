import React, { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { auth, database } from '../firebase';
import './Dashboard.css';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('month');
  const [sortBy, setSortBy] = useState('date');
  const [stats, setStats] = useState({
    income: 0,
    expense: 0,
    balance: 0
  });

  useEffect(() => {
    if (auth.currentUser) {
      const transactionsRef = ref(database, `transactions/${auth.currentUser.uid}`);
      const transactionsQuery = query(transactionsRef, orderByChild('date'));
      
      const unsubscribe = onValue(transactionsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const transactionsList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          
          setTransactions(transactionsList);
          calculateStats(transactionsList);
        }
      });

      return () => unsubscribe();
    }
  }, [filter]);

  const calculateStats = (transactionsList) => {
    const filtered = filterTransactions(transactionsList);
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    setStats({
      income,
      expense,
      balance: income - expense
    });
  };

  const filterTransactions = (transactionsList) => {
    const now = new Date();
    const filtered = transactionsList.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      switch (filter) {
        case 'day':
          return transactionDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        case 'month':
          return transactionDate.getMonth() === now.getMonth() && 
                 transactionDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>💰 대시보드</h2>
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="day">일</option>
            <option value="week">주</option>
            <option value="month">월</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="date">날짜순</option>
            <option value="amount">금액순</option>
            <option value="category">항목순</option>
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card income">
          <div className="stat-icon">📈</div>
          <h3>수입</h3>
          <p>{formatCurrency(stats.income)}</p>
        </div>
        <div className="stat-card expense">
          <div className="stat-icon">📉</div>
          <h3>지출</h3>
          <p>{formatCurrency(stats.expense)}</p>
        </div>
        <div className="stat-card balance">
          <div className="stat-icon">💳</div>
          <h3>잔액</h3>
          <p className={stats.balance >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(stats.balance)}
          </p>
        </div>
      </div>

      <div className="transactions-section">
        <h3>📋 거래 내역</h3>
        <div className="transactions-list">
          {filterTransactions(transactions).length === 0 ? (
            <div className="empty-state">
              <p>거래 내역이 없습니다.</p>
              <p>캘린더에서 거래를 추가해보세요!</p>
            </div>
          ) : (
            filterTransactions(transactions).map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <span className="category">{transaction.category}</span>
                  <span className="date">{new Date(transaction.date).toLocaleDateString('ko-KR')}</span>
                  {transaction.memo && <span className="memo">{transaction.memo}</span>}
                </div>
                <div className={`amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
