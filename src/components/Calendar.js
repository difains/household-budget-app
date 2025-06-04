import React, { useState, useEffect } from 'react';
import { ref, onValue, push } from 'firebase/database';
import { auth, database } from '../firebase';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    memo: ''
  });

  useEffect(() => {
    if (auth.currentUser) {
      const transactionsRef = ref(database, `transactions/${auth.currentUser.uid}`);
      
      const unsubscribe = onValue(transactionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const groupedByDate = {};
          Object.keys(data).forEach(key => {
            const transaction = data[key];
            const dateKey = transaction.date.split('T')[0];
            if (!groupedByDate[dateKey]) {
              groupedByDate[dateKey] = [];
            }
            groupedByDate[dateKey].push({
              id: key,
              ...transaction
            });
          });
          setTransactions(groupedByDate);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !formData.category || !formData.amount) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const transactionsRef = ref(database, `transactions/${auth.currentUser.uid}`);
      await push(transactionsRef, {
        ...formData,
        amount: parseFloat(formData.amount),
        date: selectedDate.toISOString(),
        createdAt: new Date().toISOString()
      });

      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        memo: ''
      });
      setShowModal(false);
    } catch (error) {
      alert('거래 추가에 실패했습니다.');
    }
  };

  const getDateTransactions = (date) => {
    if (!date) return [];
    const dateKey = date.toISOString().split('T')[0];
    return transactions[dateKey] || [];
  };

  const getTotalAmount = (dateTransactions, type) => {
    return dateTransactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button 
          className="nav-btn"
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
        >
          ‹
        </button>
        <h2>
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <button 
          className="nav-btn"
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
        >
          ›
        </button>
      </div>

      <div className="calendar-wrapper">
        <div className="calendar-weekdays">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div key={day} className={`weekday ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}>
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="calendar-day empty"></div>;
            }

            const dateTransactions = getDateTransactions(date);
            const income = getTotalAmount(dateTransactions, 'income');
            const expense = getTotalAmount(dateTransactions, 'expense');
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div 
                key={index} 
                className={`calendar-day ${isToday ? 'today' : ''}`}
                onClick={() => handleDateClick(date)}
              >
                <span className="day-number">{date.getDate()}</span>
                <div className="badges">
                  {income > 0 && (
                    <div className="badge income-badge">
                      +{formatCurrency(income)}
                    </div>
                  )}
                  {expense > 0 && (
                    <div className="badge expense-badge">
                      -{formatCurrency(expense)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>거래 추가</h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>구분</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === 'expense'}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    />
                    <span className="radio-custom expense">지출</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={formData.type === 'income'}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    />
                    <span className="radio-custom income">수입</span>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label>항목</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="예: 식비, 교통비, 급여 등"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>금액</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="금액을 입력하세요"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>메모 (선택사항)</label>
                <textarea
                  className="form-control"
                  value={formData.memo}
                  onChange={(e) => setFormData({...formData, memo: e.target.value})}
                  placeholder="메모를 입력하세요"
                  rows="3"
                />
              </div>
              
              <div className="modal-buttons">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
