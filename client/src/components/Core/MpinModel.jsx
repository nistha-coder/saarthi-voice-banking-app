// ========== client/src/components/Core/MpinModal.jsx ==========
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../utils/api';

const MpinModal = ({ onVerify, onClose }) => {
  const { t } = useTranslation();
  const [mpin, setMpin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/user/verify-mpin', { mpin });
      
      if (response.data.verified) {
        onVerify();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'mPIN verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mpin-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <h3>{t('mpin.enterMpin')}</h3>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder={t('mpin.enterFourDigit')}
            value={mpin}
            onChange={(e) => setMpin(e.target.value)}
            maxLength="4"
            pattern="\d{4}"
            required
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t('common.loading') : t('common.confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MpinModal;