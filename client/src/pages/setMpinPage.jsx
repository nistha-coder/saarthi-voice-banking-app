
// ========== client/src/pages/SetMpinPage.jsx ==========
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import Navbar from '../components/Layout/Navbar';
import api from '../utils/api';

const SetMpinPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mpin.length !== 4) {
      setError('mPIN must be exactly 4 digits');
      return;
    }

    if (mpin !== confirmMpin) {
      setError(t('mpin.mpinMismatch'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/user/set-mpin', { mpin, confirmMpin });
      
      if (response.data.success) {
        alert(t('mpin.mpinSet'));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set mPIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="form-card-centered">
          <h2>{t('mpin.setMpin')}</h2>
          <p className="info-text">Create a 4-digit mPIN to secure your transactions</p>
          
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit} className="form-card">
            <label>{t('mpin.mpin')}</label>
            <input
              type="password"
              placeholder={t('mpin.enterFourDigit')}
              value={mpin}
              onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
              maxLength="4"
              pattern="\d{4}"
              required
            />
            
            <label>{t('mpin.confirmMpin')}</label>
            <input
              type="password"
              placeholder={t('mpin.confirmMpin')}
              value={confirmMpin}
              onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, ''))}
              maxLength="4"
              pattern="\d{4}"
              required
            />
            
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t('common.loading') : t('common.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetMpinPage;