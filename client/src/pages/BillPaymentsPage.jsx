import { useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import {
  FaBolt,
  FaTv,
  FaSatelliteDish,
  FaTint,
  FaBurn,
  FaTimes,
} from 'react-icons/fa';

const categories = [
  { name: 'Electricity', icon: <FaBolt /> },
  { name: 'Cable TV', icon: <FaTv /> },
  { name: 'DTH', icon: <FaSatelliteDish /> },
  { name: 'Water', icon: <FaTint /> },
  { name: 'Gas', icon: <FaBurn /> },
];

const BillPaymentsPage = () => {
  const [overlayMessage, setOverlayMessage] = useState('');

  const handleCategoryClick = (label) => {
    setOverlayMessage(`${label} bill payments coming soon!`);
    setTimeout(() => setOverlayMessage(''), 2000);
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="bill-section">
          <h2>Pay Your Bills</h2>
          <p>Select a category to get started.</p>
          <div className="bill-grid">
            {categories.map((category) => (
              <button
                key={category.name}
                className="bill-card"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="bill-icon">{category.icon}</div>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {overlayMessage && (
        <div className="toast">
          <FaTimes onClick={() => setOverlayMessage('')} />
          <span>{overlayMessage}</span>
        </div>
      )}

      <style>{`
        .bill-section {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          text-align: center;
        }

        .bill-section h2 {
          font-size: 32px;
          margin-bottom: 10px;
        }

        .bill-section p {
          font-size: 18px;
          color: #555;
          margin-bottom: 30px;
        }

        .bill-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 20px;
        }

        .bill-card {
          border: none;
          border-radius: 16px;
          padding: 30px 10px;
          background: #f8f9fb;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          box-shadow: inset 0 0 0 2px transparent;
          transition: all 0.2s ease;
        }

        .bill-card:hover {
          background: #ffffff;
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
        }

        .bill-icon {
          font-size: 42px;
          color: var(--phonepe-primary);
        }

        .toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--phonepe-gradient);
          color: white;
          padding: 16px 24px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          box-shadow: 0 15px 30px rgba(95, 37, 159, 0.3);
          z-index: 200;
        }

        .toast svg {
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .bill-card {
            font-size: 16px;
            padding: 25px 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default BillPaymentsPage;

