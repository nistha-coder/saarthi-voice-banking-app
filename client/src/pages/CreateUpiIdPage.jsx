import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Layout/Navbar';
import api from '../utils/api';

const CreateUpiIdPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upiHandle, setUpiHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!upiHandle.trim()) {
      setError('Please enter a UPI handle');
      return;
    }

    // Validate UPI handle (alphanumeric, no spaces)
    if (!/^[a-zA-Z0-9]+$/.test(upiHandle)) {
      setError('UPI handle can only contain letters and numbers');
      return;
    }

    const fullUpiId = `${upiHandle}@saarthi`;
    
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/user/create-upi', { 
        upiId: fullUpiId 
      });
      
      if (response.data.success) {
        alert('UPI ID created successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create UPI ID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="form-card-centered">
          <div className="upi-header">
            <div className="upi-icon">💳</div>
            <h2>Create Your UPI ID</h2>
            <p className="info-text">
              Choose a unique UPI ID to receive payments instantly
            </p>
          </div>
          
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit} className="form-card">
            <label>Choose Your UPI Handle</label>
            <div className="upi-input-group">
              <input
                type="text"
                placeholder="yourname"
                value={upiHandle}
                onChange={(e) => setUpiHandle(e.target.value.toLowerCase())}
                maxLength="20"
                required
              />
              <span className="upi-suffix">@saarthi</span>
            </div>
            
            <div className="upi-preview">
              <strong>Your UPI ID will be:</strong>
              <div className="upi-id-display">
                {upiHandle || 'yourname'}@saarthi
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t('common.loading') : 'Generate My UPI ID'}
            </button>
          </form>

          <div className="info-box">
            <p><strong>💡 Tip:</strong> Choose a UPI ID that's easy to remember and share.</p>
            <p>Example: {user?.userName?.toLowerCase().replace(/\s+/g, '') || 'john'}@saarthi</p>
          </div>
        </div>
      </div>

      <style>{`
        .upi-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .upi-icon {
          font-size: 64px;
          margin-bottom: 15px;
        }

        .upi-input-group {
          display: flex;
          align-items: center;
          gap: 0;
          border: 2px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .upi-input-group:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .upi-input-group input {
          border: none;
          flex: 1;
          padding: 12px 15px;
          font-size: 16px;
        }

        .upi-input-group input:focus {
          outline: none;
          border: none;
        }

        .upi-suffix {
          padding: 12px 15px;
          background: #f8f9fa;
          color: #666;
          font-weight: 600;
          border-left: 1px solid #ddd;
        }

        .upi-preview {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }

        .upi-id-display {
          font-size: 20px;
          font-weight: bold;
          color: var(--primary-color);
          margin-top: 8px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};

export default CreateUpiIdPage;