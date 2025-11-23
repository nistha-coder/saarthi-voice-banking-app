// ========== client/src/components/Dashboard/UpiDisplay.jsx ==========
import { useState } from 'react';
import { FaCopy, FaDownload, FaShareAlt, FaUserCircle, FaCheck } from 'react-icons/fa';

const UpiDisplay = ({ upiId, qrCodeData }) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');

  if (!upiId || !qrCodeData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeData;
    link.download = `${upiId}-qr.png`;
    link.click();
  };

  const handleShare = async () => {
    const shareText = `My Saarthi UPI ID: ${upiId}`;

    try {
      const response = await fetch(qrCodeData);
      const blob = await response.blob();
      const qrFile = new File([blob], 'upi-qr.png', { type: blob.type });

      if (navigator.share && navigator.canShare({ files: [qrFile] })) {
        await navigator.share({
          title: 'Saarthi UPI',
          text: shareText,
          files: [qrFile]
        });
      } else {
        navigator.clipboard.writeText(shareText);
        setShareFeedback('Details copied!');
        setTimeout(() => setShareFeedback(''), 2000);
      }
    } catch (error) {
      setShareFeedback('Unable to share now.');
      setTimeout(() => setShareFeedback(''), 2000);
    }
  };

  const userName = upiId.split('@')[0];

  return (
    <>
      <div className="upi-modern-card">
        <div className="upi-card-header">
          <FaUserCircle className="upi-user-icon" />
          <h3 className="upi-name">{userName}</h3>
        </div>

        <div className="upi-main-qr">
          <img src={qrCodeData} alt="UPI QR" />
        </div>

        {/* ===== UPI ID COPY SECTION ===== */}
        <p className={`upi-id-text ${copied ? "copied-text" : ""}`}>
          UPI ID: <span>{upiId}</span>

          {/* ICON: changes on copy */}
          {copied ? (
            <FaCheck className="copy-icon copied" />
          ) : (
            <FaCopy
              className="copy-icon"
              onClick={handleCopy}
            />
          )}

          {/* Copied Text */}
          {copied && <span className="copied-label">Copied!</span>}
        </p>

        <button className="share-qr-btn" onClick={handleShare}>
          <FaShareAlt /> Share QR code
        </button>

        {shareFeedback && <small>{shareFeedback}</small>}
      </div>

      {/* ====== MODAL ====== */}
      {showQrModal && (
        <div className="qr-modal">
          <div className="modal-overlay" onClick={() => setShowQrModal(false)} />
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowQrModal(false)}>
              ×
            </button>
            <h3>My QR Code</h3>

            <div className="modal-qr">
              <img src={qrCodeData} alt="Full QR" />
            </div>

            <button className="btn-primary large" onClick={handleDownloadQR}>
              <FaDownload /> Download QR
            </button>
          </div>
        </div>
      )}

      <style>{`
        .upi-modern-card {
          background: white;
          padding: 30px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
          border: 1.5px solid #e5e7eb;
          width: 100%;
        }

        .upi-user-icon {
          font-size: 55px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .upi-name {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 10px;
        }

        .upi-main-qr img {
          width: 190px;
          height: 190px;
          border-radius: 12px;
        }

        .upi-id-text {
          font-size: 15px;
          margin-top: 16px;
          color: #4b5563;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .upi-id-text span {
          font-weight: 600;
          color: #111827;
        }

        /* Copy Icon */
        .copy-icon {
          cursor: pointer;
          color: #2563eb;
          transition: 0.3s ease;
        }

        .copy-icon:hover {
          transform: scale(1.1);
        }

        /* Copied State */
        .copy-icon.copied {
          color: #1d4ed8;
        }

        .copied-label {
          font-size: 14px;
          color: #1d4ed8;
          font-weight: 600;
          margin-left: 4px;
        }

        .copied-text span {
          color: #2563eb;
        }

        .share-qr-btn {
          margin-top: 20px;
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default UpiDisplay;
