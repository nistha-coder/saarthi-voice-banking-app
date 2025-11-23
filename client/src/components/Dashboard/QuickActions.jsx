
// ========== client/src/components/Dashboard/QuickActions.jsx (UPDATED) ==========
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FaPaperPlane, FaFileInvoiceDollar, FaMobileAlt, FaHistory, FaCreditCard } from 'react-icons/fa';

const QuickActions = ({ isAtmLinked }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleMakePayment = () => {
    if (!isAtmLinked) {
      navigate('/link-atm');
      return;
    }
    navigate('/make-payment');
  };

  const handlePayBills = () => {
    if (!isAtmLinked) {
      navigate('/link-atm');
      return;
    }
    navigate('/pay-bills');
  };

  const handleRecharge = () => {
    if (!isAtmLinked) {
      navigate('/link-atm');
      return;
    }
    navigate('/mobile-recharge');
  };

  if (!isAtmLinked) {
    return (
      <div className="quick-actions">
        <h3 className="section-subtitle">Quick Actions</h3>
        <div className="actions-grid single">
          <Link to="/link-atm" className="action-card primary">
            <div className="action-icon">
              <FaCreditCard size={32} />
            </div>
            <div className="action-text">
              <h4>{t('navigation.linkAtm')}</h4>
              <p>Get started by linking your card</p>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="quick-actions">
      <h3 className="section-subtitle" style={{color:"#3A2C6A"}}>Quick Actions</h3>
      <div className="actions-grid">
        <button className="action-card" onClick={handleMakePayment}>
          <div className="action-icon">
            <FaPaperPlane size={28} />
          </div>
          <div className="action-text">
            <h4>Make Payment</h4>
            <p>Send money instantly</p>
          </div>
        </button>

        <button className="action-card" onClick={handlePayBills}>
          <div className="action-icon">
            <FaFileInvoiceDollar size={28} />
          </div>
          <div className="action-text">
            <h4>Pay Bills</h4>
            <p>Electricity, phone, etc.</p>
          </div>
        </button>

        <button className="action-card" onClick={handleRecharge}>
          <div className="action-icon">
            <FaMobileAlt size={28} />
          </div>
          <div className="action-text">
            <h4>Mobile Recharge</h4>
            <p>Prepaid & DTH recharge</p>
          </div>
        </button>

        <Link to="/transaction-history" className="action-card">
          <div className="action-icon">
            <FaHistory size={28} />
          </div>
          <div className="action-text">
            <h4>View History</h4>
            <p>Transaction history</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;