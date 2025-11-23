
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import Navbar from '../components/Layout/Navbar';
import api from '../utils/api';

const LinkAtmPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/user/link-atm', formData);
      
      if (response.data.success) {
        alert(t('atm.linkSuccess'));
        // CRITICAL: Redirect to set-mpin page
        navigate('/set-mpin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link ATM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="form-card-centered">
          <h2>{t('atm.linkAtm')}</h2>
          <p className="info-text">Enter your ATM card details to link your account</p>
          
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit} className="form-card">
            <label>{t('atm.cardNumber')}</label>
            <input
              type="text"
              name="cardNumber"
              placeholder={t('atm.enterCardNumber')}
              value={formData.cardNumber}
              onChange={handleChange}
              maxLength="16"
              pattern="\d{16}"
              required
            />
            
            <label>{t('atm.expiryDate')}</label>
            <input
              type="text"
              name="expiryDate"
              placeholder={t('atm.enterExpiry')}
              value={formData.expiryDate}
              onChange={handleChange}
              maxLength="5"
              pattern="\d{2}/\d{2}"
              required
            />
            
            <label>{t('atm.cvv')}</label>
            <input
              type="password"
              name="cvv"
              placeholder={t('atm.enterCvv')}
              value={formData.cvv}
              onChange={handleChange}
              maxLength="3"
              pattern="\d{3}"
              required
            />
            
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t('common.loading') : t('common.submit')}
            </button>
          </form>

          <div className="info-box">
            <p><strong>Note:</strong> For demo purposes, you can use any 16-digit card number.</p>
            <p>Example: 1234567890123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkAtmPage;