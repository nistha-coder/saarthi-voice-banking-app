import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';

const MobileRechargePage = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="coming-soon-card">
          <div className="coming-icon">📱</div>
          <h2>Mobile Recharge</h2>
          <p>We are preparing a simpler recharge experience for you.</p>
          <p className="coming-subtext">Feature coming soon.</p>
          <button className="btn-primary large" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>

      <style>{`
        .coming-soon-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .coming-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .coming-soon-card h2 {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .coming-soon-card p {
          font-size: 18px;
          color: #555;
        }

        .coming-subtext {
          margin-bottom: 30px;
          font-weight: 600;
          color: var(--phonepe-primary);
        }

        .btn-primary.large {
          font-size: 18px;
          padding: 16px 32px;
        }
      `}</style>
    </div>
  );
};

export default MobileRechargePage;

