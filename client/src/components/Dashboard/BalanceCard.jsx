
// ========== client/src/components/Dashboard/BalanceCard.jsx ==========
import { useTranslation } from '../../hooks/useTranslation';

const BalanceCard = ({ balance }) => {
  const { t } = useTranslation();

  return (
    <div className="card balance-card">
      <h3>{t('dashboard.bankBalance')}</h3>
      <div className="balance-amount">
        ₹{balance.toLocaleString('en-IN')}
      </div>
    </div>
  );
};

export default BalanceCard;