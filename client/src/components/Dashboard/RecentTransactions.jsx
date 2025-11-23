

// ========== client/src/components/Dashboard/RecentTransactions.jsx (UPDATED) ==========
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FaArrowRight } from 'react-icons/fa';

const RecentTransactions = ({ transactions, isAtmLinked }) => {
  const { t } = useTranslation();

  return (
    <div className="card transactions-card">
      <h3>{t('dashboard.recentTransactions')}</h3>
      
      {!isAtmLinked ? (
        // Show message if ATM not linked
        <div className="empty-state">
          <p className="empty-message">
            🔗 Link your bank account to see recent transactions
          </p>
          <Link to="/link-atm" className="btn-link">
            Link Account Now
          </Link>
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <p>{t('dashboard.noTransactions')}</p>
        </div>
      ) : (
        <>
          <div className="transactions-list">
            {transactions.slice(0, 5).map((txn) => (
              <div key={txn.id} className={`transaction-item ${txn.type}`}>
                <div className="txn-icon">
                  {txn.type === 'credit' ? '↓' : '↑'}
                </div>
                <div className="txn-details">
                  <div className="txn-description">{txn.description}</div>
                  <div className="txn-date">
                    {new Date(txn.date).toLocaleDateString()}
                  </div>
                </div>
                <div className={`txn-amount ${txn.type}`}>
                  {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* View All Link - NEW */}
          {transactions.length > 5 && (
            <Link to="/transaction-history" className="view-all-link">
              View All Transactions <FaArrowRight />
            </Link>
          )}
        </>
      )}

      <style>{`
        .empty-state {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-message {
          color: #666;
          font-size: 16px;
          margin-bottom: 15px;
        }

        .btn-link {
          display: inline-block;
          padding: 10px 20px;
          background: var(--primary-color);
          color: white;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .view-all-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 15px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          text-decoration: none;
          color: var(--primary-color);
          font-weight: 600;
          transition: all 0.3s;
        }

        .view-all-link:hover {
          background: var(--primary-color);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default RecentTransactions;
