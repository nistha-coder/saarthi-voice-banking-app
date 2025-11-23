// ========== client/src/pages/DashboardPage.jsx (UPDATED - REMOVED REMINDERS & FIXED MIC) ==========

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Layout/Navbar';
import VoiceAssistantMic from '../components/Core/VoiceAssistantMic';
import AccountInfo from '../components/Dashboard/AccountInfo';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import QuickActions from '../components/Dashboard/QuickActions';
import UpiDisplay from '../components/Dashboard/UpiDisplay';
import { useAppState } from '../contexts/AppStateContext';
import api from '../utils/api';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { syncWalletBalance, addedTransactions } = useAppState();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/user/details');
      setDashboardData(response.data);

      if (response.data?.bankDetails?.balance !== undefined) {
        syncWalletBalance(response.data.bankDetails.balance);
      }
    } catch (error) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const userData = dashboardData?.user;
  const apiTransactions = dashboardData?.recentTransactions || [];

  const combinedTransactions = useMemo(() => {
    const merged = [...addedTransactions, ...apiTransactions];
    return merged.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [addedTransactions, apiTransactions]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Navbar />
        <div className="container">
          <div className="error-screen">
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      
      {/* Fixed Mic Icon */}
      <VoiceAssistantMic />

      <div className="dashboard-container">

        {/* -------- TWO COLUMN LAYOUT -------- */}
        <div className="dashboard-columns">

          {/* LEFT COLUMN */}
          <div className="left-column">

            {/* Welcome Section */}
            <div className="welcome-section">
              <h2 className="welcome-text">
                {t('dashboard.welcome')}, {userData?.userName}!
              </h2>
              <p className="welcome-subtext">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Account Info */}
            <AccountInfo user={userData} />

            {/* Quick Actions */}
            <QuickActions isAtmLinked={userData?.isAtmLinked} />

            {/* Prompts */}
            {!userData?.isAtmLinked && (
              <div className="prompt-card warning">
                <div className="prompt-icon">⚠️</div>
                <div className="prompt-content">
                  <h3>{t('dashboard.linkAtmPrompt')}</h3>
                  <p>Link your ATM card to start using all features</p>
                  <Link to="/link-atm" className="btn-primary large">
                    {t('navigation.linkAtm')}
                  </Link>
                </div>
              </div>
            )}

            {userData?.isAtmLinked && !userData?.isMpinSet && (
              <div className="prompt-card warning">
                <div className="prompt-icon">🔒</div>
                <div className="prompt-content">
                  <h3>{t('dashboard.setMpinPrompt')}</h3>
                  <p>Set a 4-digit mPIN to secure your transactions</p>
                  <Link to="/set-mpin" className="btn-primary large">
                    {t('mpin.setMpin')}
                  </Link>
                </div>
              </div>
            )}

            {userData?.isMpinSet && !userData?.upiId && (
              <div className="prompt-card info">
                <div className="prompt-icon">💳</div>
                <div className="prompt-content">
                  <h3>Create Your UPI ID</h3>
                  <p>Generate your unique UPI ID to receive payments</p>
                  <Link to="/create-upi" className="btn-primary large">
                    Create UPI ID
                  </Link>
                </div>
              </div>
            )}

            {/* Transactions */}
            <RecentTransactions
              transactions={combinedTransactions}
              isAtmLinked={userData?.isAtmLinked}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-column">
            {userData?.upiId && userData?.qrCodeData && (
              <UpiDisplay
                upiId={userData.upiId}
                qrCodeData={userData.qrCodeData}
              />
            )}
          </div>

        </div>
      </div>

      {/* -------- STYLES -------- */}
      <style>{`
        .dashboard-columns {
          display: grid;
          grid-template-columns: 3fr 1.2fr;
          gap: 32px;
          padding: 20px;
        }

        .left-column {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .right-column {
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        /* Fixed Mic Icon */
        .fixed-mic-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
        }

        @media (max-width: 900px) {
          .dashboard-columns {
            grid-template-columns: 1fr;
          }
          .right-column {
            position: relative;
            top: 0;
          }
          .fixed-mic-container {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;