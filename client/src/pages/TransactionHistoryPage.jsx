// ========== client/src/pages/TransactionHistoryPage.jsx (NEW) ==========
import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Navbar from '../components/Layout/Navbar';
import { FaHistory, FaFilter } from 'react-icons/fa';
import api from '../utils/api';
import { useAppState } from '../contexts/AppStateContext';

const TransactionHistoryPage = () => {
  const { t } = useTranslation();
  const { addedTransactions } = useAppState();
  const [allTransactions, setAllTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('week');
  const [typeFilter, setTypeFilter] = useState('all'); // all | credit | debit

  useEffect(() => {
    fetchTransactions();
  }, [timeFilter, addedTransactions]);

  useEffect(() => {
    setTransactions(applyFilters(allTransactions, timeFilter, typeFilter));
  }, [allTransactions, timeFilter, typeFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/user/transactions?filter=${timeFilter}`);
      setAllTransactions([...addedTransactions, ...response.data.transactions]);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (list, time, type) => {
    const now = new Date();
    return list
      .filter((txn) => {
      const txnDate = new Date(txn.date);
      const diffDays = (now - txnDate) / (1000 * 60 * 60 * 24);
      const timeMatch = time === 'week' ? diffDays <= 7 : diffDays <= 31;
      const typeMatch = type === 'all' ? true : txn.type === type;
        return timeMatch && typeMatch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <FaHistory size={40} color='#3A2C6A' />
          <h2 style={{ color: '#3A2C6A' }}>Transaction History</h2>
        </div>

        <div className="history-container">
          {/* Filter Buttons */}
          <div className="filter-section">
            <FaFilter /> <span>Time range:</span>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
                onClick={() => setTimeFilter('week')}
              >
                Last Week
              </button>
              <button
                className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
                onClick={() => setTimeFilter('month')}
              >
                Last Month
              </button>
            </div>
          </div>
          <div className="filter-section type">
            <span>Transaction type:</span>
            <div className="filter-buttons">
              <button
                className={`filter-btn pill ${typeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTypeFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn pill ${typeFilter === 'credit' ? 'active' : ''}`}
                onClick={() => setTypeFilter('credit')}
              >
                Credit
              </button>
              <button
                className={`filter-btn pill ${typeFilter === 'debit' ? 'active' : ''}`}
                onClick={() => setTypeFilter('debit')}
              >
                Debit
              </button>
            </div>
          </div>

          {/* Transactions List */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions found for this period</p>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.map((txn) => (
                <div key={txn.id} className={`transaction-item ${txn.type}`}>
                  <div className="txn-icon">
                    {txn.type === 'credit' ? '↓' : '↑'}
                  </div>
                  <div className="txn-details">
                    <div className="txn-description">{txn.description}</div>
                    <div className="txn-date">
                      {new Date(txn.date).toLocaleString()}
                    </div>
                  </div>
                  <div className={`txn-amount ${txn.type}`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="txn-status">
                    <span className={`status-badge ${txn.status}`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .page-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
        }

        .history-container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .filter-section {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }

        .filter-section.type {
          border: none;
          padding-bottom: 0;
          margin-top: -10px;
        }

        .filter-section span {
          font-weight: 600;
          color: var(--dark-color);
        }

        .filter-buttons {
          display: flex;
          gap: 10px;
          margin-left: auto;
        }

        .filter-btn {
          padding: 8px 20px;
          border: 2px solid #ddd;
          border-radius: 20px;
          background: white;
          color: var(--dark-color);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-btn:hover {
          border-color: var(--primary-color);
        }

        .filter-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .filter-btn.pill {
          border-radius: 999px;
        }

        .loading-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          border-left: 4px solid #ddd;
        }

        .transaction-item.credit {
          border-left-color: var(--success-color);
        }

        .transaction-item.debit {
          border-left-color: var(--danger-color);
        }

        .txn-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          background: #e9ecef;
        }

        .transaction-item.credit .txn-icon {
          background: #d4edda;
          color: var(--success-color);
        }

        .transaction-item.debit .txn-icon {
          background: #f8d7da;
          color: var(--danger-color);
        }

        .txn-details {
          flex: 1;
        }

        .txn-description {
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--dark-color);
        }

        .txn-date {
          font-size: 13px;
          color: #666;
        }

        .txn-amount {
          font-weight: bold;
          font-size: 18px;
          margin-right: 15px;
        }

        .txn-amount.credit {
          color: var(--success-color);
        }

        .txn-amount.debit {
          color: var(--danger-color);
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.completed {
          background: #d4edda;
          color: var(--success-color);
        }

        .status-badge.pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-badge.failed {
          background: #f8d7da;
          color: var(--danger-color);
        }
      `}</style>
    </div>
  );
};

export default TransactionHistoryPage;