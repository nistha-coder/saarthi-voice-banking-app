
// ========== client/src/pages/HistoryPage.jsx ==========
import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Navbar from '../components/Layout/Navbar';
import { FaHistory } from 'react-icons/fa';
import api from '../utils/api';

const HistoryPage = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/assistant/history');
      setHistory(response.data.history);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <FaHistory size={40} color="#3A2C6A" />
          <h2 style={{ color: "#3A2C6A" }}>{t('navigation.history')}</h2>
        </div>
        
        <div className="history-container">
          {history.length === 0 ? (
            <div className="empty-state">
              <p>No chat history yet</p>
              <p className="hint">Start using the voice assistant to see your conversation history</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="query">
                    <strong>You:</strong> {item.query}
                  </div>
                  <div className="response">
                    <strong>Assistant:</strong> {item.response}
                  </div>
                  <div className="timestamp">
                    {new Date(item.timestamp).toLocaleString()}
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
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .hint {
          font-size: 14px;
          margin-top: 10px;
          color: #999;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .history-item {
          padding: 20px;
          border-left: 4px solid var(--primary-color);
          background: #f8f9fa;
          border-radius: 8px;
        }

        .query {
          margin-bottom: 10px;
          color: var(--primary-color);
        }

        .response {
          margin-bottom: 10px;
          color: var(--dark-color);
        }

        .timestamp {
          font-size: 12px;
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default HistoryPage;

