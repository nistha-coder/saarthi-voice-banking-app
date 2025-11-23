// ========== client/src/components/Dashboard/AccountInfo.jsx (NEW) ==========
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaChartLine, FaHandHoldingUsd } from 'react-icons/fa';
import api from '../../utils/api';
import { API_BASE_URL } from '../../utils/constants';

const AccountInfo = ({ user }) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [mpin, setMpin] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalResult, setModalResult] = useState(null);

  /**
   * CRITICAL: Check if ATM is linked before proceeding
   */
  const handleCheckBalance = () => {
    if (!user?.isAtmLinked) {
      // Redirect to link account page
      navigate('/link-atm');
      return;
    }

    // Show mPIN modal
    setModalAction('balance');
    openModal();
  };

  const handleCheckFDs = () => {
    if (!user?.isAtmLinked) {
      navigate('/link-atm');
      return;
    }

    setModalAction('fds');
    openModal();
  };

  const handleCheckLoans = () => {
    if (!user?.isAtmLinked) {
      navigate('/link-atm');
      return;
    }

    setModalAction('loans');
    openModal();
  };

  const openModal = () => {
    setModalOpen(true);
    setMpin('');
    setModalError('');
    setModalResult(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalLoading(false);
    setModalError('');
    setModalResult(null);
  };

  const buildResult = (data, action) => {
    if (action === 'balance') {
      return {
        title: 'Available Balance',
        lines: [`₹${data.bankDetails.balance.toLocaleString('en-IN')}`],
      };
    }
    if (action === 'fds') {
      const totalFD = data.bankDetails.fds.reduce((sum, fd) => sum + fd.amount, 0);
      return {
        title: 'Fixed Deposits',
        lines: [
          `Active FDs: ${data.bankDetails.fds.length}`,
          `Total Value: ₹${totalFD.toLocaleString('en-IN')}`,
        ],
      };
    }
    const totalOutstanding = data.bankDetails.loans.reduce(
      (sum, loan) => sum + loan.outstanding,
      0
    );
    return {
      title: 'Loans Summary',
      lines: [
        `Active Loans: ${data.bankDetails.loans.length}`,
        `Outstanding: ₹${totalOutstanding.toLocaleString('en-IN')}`,
      ],
    };
  };

  const verifyMpinRemote = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/user/verify-mpin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify({ mpin }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Incorrect MPIN. Please try again.');
    }

    return response.json();
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (mpin.length !== 4) {
      setModalError('Please enter 4 digits');
      return;
    }

    setModalLoading(true);
    setModalError('');

    try {
      await verifyMpinRemote();
      const response = await api.get('/user/details');
      setModalResult(buildResult(response.data, modalAction));
    } catch (error) {
      setMpin('');
      setModalError(error.message || 'Incorrect MPIN. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="card account-info-card">
      <h3>Account Information</h3>
      
      <div className="account-buttons">
        <button 
          onClick={handleCheckBalance} 
          className="account-btn"
          disabled={modalLoading}
        >
          <FaMoneyBillWave size={24} />
          <span>Check Bank Balance</span>
          {!user?.isAtmLinked && <span className="lock-badge">🔒</span>}
        </button>

        <button 
          onClick={handleCheckFDs} 
          className="account-btn"
          disabled={modalLoading}
        >
          <FaChartLine size={24} />
          <span>Check FDs Status</span>
          {!user?.isAtmLinked && <span className="lock-badge">🔒</span>}
        </button>

        <button 
          onClick={handleCheckLoans} 
          className="account-btn"
          disabled={modalLoading}
        >
          <FaHandHoldingUsd size={24} />
          <span>Check Loan Status</span>
          {!user?.isAtmLinked && <span className="lock-badge">🔒</span>}
        </button>
      </div>

      {!user?.isAtmLinked && (
        <div className="info-message">
          <p>💡 Link your ATM card to access account information</p>
        </div>
      )}

      {modalOpen && (
        <div className="secure-modal">
          <div className="modal-overlay" onClick={closeModal} />
          <div className="modal-content">
            <button type="button" className="close-btn" onClick={closeModal} aria-label="Close">
              ×
            </button>
            {!modalResult ? (
              <>
                <h3>Enter MPIN to View Details</h3>
                <form onSubmit={handleModalSubmit}>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength="4"
                    placeholder="Enter 4-digit MPIN"
                    value={mpin}
                    onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  {modalError && <p className="error">{modalError}</p>}
                  <button type="submit" className="btn-primary large" disabled={modalLoading}>
                    {modalLoading ? 'Verifying...' : 'Submit'}
                  </button>
                </form>
              </>
            ) : (
              <div className="result-state">
                <h3>{modalResult.title}</h3>
                <ul>
                  {modalResult.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <button className="btn-primary large" onClick={closeModal}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .account-info-card h3 {
          margin-bottom: 20px;
        }

        .account-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .account-btn {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 18px 24px;
          background: #f8f9fa;
          border: 2px solid #ddd;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          font-size: 18px;
        }

        .account-btn:hover:not(:disabled) {
          background: #e9ecef;
          border-color: var(--primary-color);
          transform: translateX(5px);
        }

        .account-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .account-btn span {
          font-weight: 600;
          color: var(--dark-color);
        }

        .lock-badge {
          margin-left: auto;
          font-size: 18px;
        }

        .info-message {
          margin-top: 15px;
          padding: 12px;
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          border-radius: 4px;
        }

        .info-message p {
          margin: 0;
          color: #856404;
          font-size: 14px;
        }

        .secure-modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
        }

        .secure-modal .modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
        }

        .secure-modal .modal-content {
          position: relative;
          max-width: 420px;
          width: 90%;
          border-radius: 28px;
          padding: 28px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 25px 65px rgba(15, 23, 42, 0.35);
          backdrop-filter: blur(18px);
          color: white;
        }

        .secure-modal .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          font-size: 20px;
          cursor: pointer;
        }

        .secure-modal h3 {
          text-align: center;
          margin-bottom: 20px;
          font-size: 22px;
          color: white;
        }

        .secure-modal input {
          width: 100%;
          padding: 18px;
          font-size: 28px;
          text-align: center;
          letter-spacing: 14px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          margin-bottom: 18px;
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .secure-modal input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .secure-modal .btn-primary.large {
          width: 100%;
          justify-content: center;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
        }

        .secure-modal .error {
          color: #fee2e2;
          margin-bottom: 12px;
          text-align: center;
        }

        .result-state ul {
          list-style: none;
          padding: 0;
          margin: 20px 0;
          font-size: 20px;
          color: white;
        }

        .result-state li + li {
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default AccountInfo;