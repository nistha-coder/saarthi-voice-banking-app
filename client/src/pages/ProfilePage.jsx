
// ========== client/src/pages/ProfilePage.jsx ==========
import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Layout/Navbar';
import { FaUserCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../utils/api';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
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
        <div className="profile-container">
          <div className="profile-header">
            <FaUserCircle size={80} color="var(--primary-color)" />
            <h2 style={{ color: '#3A2C6A' }}>{t('profile.myProfile')}</h2>
          </div>

          <div className="profile-card">
            <div className="profile-item">
              <label>{t('profile.name')}:</label>
              <span>{profile?.userName}</span>
            </div>
            
            <div className="profile-item">
              <label>{t('profile.mobile')}:</label>
              <span>{profile?.mobileNumber}</span>
            </div>
            
            <div className="profile-item">
              <label>{t('profile.voiceEnrolled')}:</label>
              <span className="status-badge">
                {profile?.voiceEnrolled ? (
                  <>
                    <FaCheckCircle color="var(--success-color)" /> Yes
                  </>
                ) : (
                  <>
                    <FaTimesCircle color="var(--danger-color)" /> No
                  </>
                )}
              </span>
            </div>
            
            <div className="profile-item">
              <label>{t('profile.atmLinked')}:</label>
              <span className="status-badge">
                {profile?.isAtmLinked ? (
                  <>
                    <FaCheckCircle color="var(--success-color)" /> Linked
                  </>
                ) : (
                  <>
                    <FaTimesCircle color="var(--danger-color)" /> Not Linked
                  </>
                )}
              </span>
            </div>
            
            <div className="profile-item">
              <label>{t('profile.mpinSet')}:</label>
              <span className="status-badge">
                {profile?.isMpinSet ? (
                  <>
                    <FaCheckCircle color="var(--success-color)" /> Set
                  </>
                ) : (
                  <>
                    <FaTimesCircle color="var(--danger-color)" /> Not Set
                  </>
                )}
              </span>
            </div>

            {profile?.upiId && (
              <div className="profile-item">
                <label>UPI ID:</label>
                <span className="upi-badge">{profile.upiId}</span>
              </div>
            )}
            
            <div className="profile-item">
              <label>{t('profile.memberSince')}:</label>
              <span>{new Date(profile?.createdAt).toLocaleDateString()}</span>
            </div>

            {profile?.atmDetails && (
              <div className="profile-item">
                <label>Linked Card:</label>
                <span>{profile.atmDetails.cardNumberMasked}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .profile-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .profile-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .profile-header h2 {
          color: white;
          margin-top: 15px;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .upi-badge {
          font-family: monospace;
          background: var(--primary-color);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;