import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import { useAppState } from '../contexts/AppStateContext';
import { API_BASE_URL } from '../utils/constants';
import api from '../utils/api';

const steps = {
  method: 1,
  input: 2,
  confirm: 3,
  amount: 4,
  mpin: 5,
  result: 6,
};

const paymentOptions = [
  { id: 'mobile', title: 'Mobile Number', description: 'Pay using 10-digit number', emoji: '📱' },
  { id: 'upi', title: 'UPI ID', description: 'Pay using UPI handle', emoji: '💠' },
];

const MakePaymentPage = () => {
  const navigate = useNavigate();
  const { walletBalance, setWalletBalance, addTransaction } = useAppState();

  const [currentStep, setCurrentStep] = useState(steps.method);
  const [payMethod, setPayMethod] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [mpin, setMpin] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [upiVerified, setUpiVerified] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);

  const resetFlow = () => {
    setCurrentStep(steps.method);
    setPayMethod('');
    setIdentifier('');
    setAmount('');
    setMpin('');
    setProcessing(false);
    setResult(null);
    setUpiVerified(false);
    setVerifyingUpi(false);
  };

  const handleMethodSelect = (method) => {
    setPayMethod(method);
    setIdentifier('');
    setUpiVerified(false);
    setCurrentStep(steps.input);
  };

  const validateIdentifier = () => {
    if (payMethod === 'mobile') {
      return /^\d{10}$/.test(identifier);
    }
    if (payMethod === 'upi') {
      return /^[\w.-]+@[\w.-]+$/.test(identifier);
    }
    return false;
  };

  const handleConfirmDetails = () => {
    if (!validateIdentifier()) return;
    if (payMethod === 'upi' && !upiVerified) return;
    setCurrentStep(steps.confirm);
  };

  const handleAmountNext = () => {
    if (!amount || Number(amount) <= 0) return;
    setCurrentStep(steps.mpin);
  };

  const handleVerifyUpi = () => {
    if (!validateIdentifier() || upiVerified) return;
    setVerifyingUpi(true);
    setTimeout(() => {
      setVerifyingUpi(false);
      setUpiVerified(true);
    }, 1000);
  };

  const verifyMpinRemote = async () => {
    const token = localStorage.getItem('token');
    
const response = await api.post('/user/verify-mpin', { mpin });
return response.data;

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Incorrect MPIN. Please try again.');
    }
  };

  const handleProcessPayment = async () => {
    setProcessing(true);
    setResult(null);

    const paymentAmount = Number(amount);
    const beneficiary = payMethod === 'mobile' ? `+91 ${identifier}` : identifier;

    if (paymentAmount > walletBalance) {
      setResult({
        status: 'failed',
        message: 'Insufficient balance to complete this transaction.',
      });
      setProcessing(false);
      setCurrentStep(steps.result);
      return;
    }

    try {
      if (mpin.length !== 4) {
        throw new Error('Please enter 4-digit MPIN');
      }

      await verifyMpinRemote();

     
      
const newBalance = walletBalance - paymentAmount;

// 🔥 Update balance on server
await api.post("/user/update-balance", { newBalance });
setWalletBalance(newBalance);

// 🔥 Add transaction locally
addTransaction({
  id: `txn-${Date.now()}`,
  type: 'debit',
  amount: paymentAmount,
  description: `Paid to ${beneficiary}`,
  status: 'completed',
  date: new Date().toISOString(),
});
      setResult({
        status: 'success',
        message: 'Payment successful!',
        beneficiary,
        amount: paymentAmount,
        reference: `SAARTHI${Date.now().toString().slice(-6)}`,
      });
    } catch (error) {
      setMpin('');
      setResult({
        status: 'failed',
        message: error.message || 'Transaction failed. Please try again.',
      });
    } finally {
      setProcessing(false);
      setCurrentStep(steps.result);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case steps.method:
        return (
          <div className="step-card">
            <h2 className="step-title">How do you want to pay?</h2>
            <div className="options-grid">
              {paymentOptions.map((option) => (
                <button
                  key={option.id}
                  className="option-card"
                  onClick={() => handleMethodSelect(option.id)}
                >
                  <div className="option-icon">{option.emoji}</div>
                  <div className="option-title">{option.title}</div>
                  <p>{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        );
      case steps.input:
        return (
          <div className="step-card">
            <h2 className="step-title">
              {payMethod === 'mobile' ? 'Enter Mobile Number' : 'Enter UPI ID'}
            </h2>
            <div className="input-row">
              <input
                className="input-field"
                placeholder={payMethod === 'mobile' ? '10-digit number' : 'example@bank'}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value.replace(/\s/g, ''));
                  if (payMethod === 'upi') {
                    setUpiVerified(false);
                  }
                }}
                maxLength={payMethod === 'mobile' ? 10 : 50}
                inputMode={payMethod === 'mobile' ? 'numeric' : 'text'}
              />
              {payMethod === 'upi' && (
                <button
                  type="button"
                  className={`verify-btn ${upiVerified ? 'verified' : ''}`}
                  onClick={handleVerifyUpi}
                  disabled={!validateIdentifier() || verifyingUpi || upiVerified}
                >
                  {upiVerified ? 'Verified' : verifyingUpi ? 'Verifying…' : 'Verify'}
                </button>
              )}
            </div>
            <div className="step-actions">
              <button className="btn-secondary large" onClick={() => setCurrentStep(steps.method)}>
                Back
              </button>
              <button
                className="btn-primary large"
                onClick={handleConfirmDetails}
                disabled={!validateIdentifier() || (payMethod === 'upi' && !upiVerified)}
              >
                Continue
              </button>
            </div>
          </div>
        );
      case steps.confirm:
        return (
          <div className="step-card">
            <h2 className="step-title">Confirm Details</h2>
            <p className="confirm-text">{identifier}</p>
            <div className="step-actions column">
              <button className="btn-secondary large" onClick={() => setCurrentStep(steps.input)}>
                {payMethod === 'upi' ? 'Edit UPI ID' : 'Edit Number?'}
              </button>
              <button className="btn-primary large" onClick={() => setCurrentStep(steps.amount)}>
                Proceed
              </button>
            </div>
          </div>
        );
      case steps.amount:
        return (
          <div className="step-card">
            <h2 className="step-title">Enter Amount</h2>
            <div className="amount-wrapper">
              <span>₹</span>
              <input
                type="number"
                min="1"
                className="amount-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <p className="balance-hint">Available Balance: ₹{walletBalance.toLocaleString('en-IN')}</p>
            <div className="step-actions">
              <button className="btn-secondary large" onClick={() => setCurrentStep(steps.confirm)}>
                Back
              </button>
              <button
                className="btn-primary large"
                onClick={handleAmountNext}
                disabled={!amount || Number(amount) <= 0}
              >
                Continue
              </button>
            </div>
          </div>
        );
      case steps.mpin:
        return (
          <div className="step-card">
            <h2 className="step-title">Authorize Payment</h2>
            <div className="summary-box">
              <p>Paying to</p>
              <strong>{payMethod === 'mobile' ? `+91 ${identifier}` : identifier}</strong>
              <p>Amount</p>
              <strong>₹{Number(amount).toLocaleString('en-IN')}</strong>
            </div>
            <input
              className="mpin-input"
              type="password"
              maxLength="4"
              inputMode="numeric"
              placeholder="Enter 4-digit MPIN"
              value={mpin}
              onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
            />
            <div className="step-actions">
              <button className="btn-secondary large" onClick={() => setCurrentStep(steps.amount)}>
                Back
              </button>
              <button
                className="btn-primary large"
                onClick={handleProcessPayment}
                disabled={processing || mpin.length !== 4}
              >
                {processing ? 'Processing...' : 'Pay Securely'}
              </button>
            </div>
          </div>
        );
      case steps.result:
        return (
          <div className="step-card result-card">
            {result?.status === 'success' ? (
              <>
                <div className="result-icon success">✓</div>
                <h2>Payment Successful</h2>
                <p>Reference ID: {result.reference}</p>
                <p>Amount Paid: ₹{result.amount?.toLocaleString('en-IN')}</p>
                <p>Recipient: {result.beneficiary}</p>
              </>
            ) : (
              <>
                <div className="result-icon failure">!</div>
                <h2>Transaction Failed</h2>
                <p>{result?.message || 'Please try again later.'}</p>
              </>
            )}
            <div className="step-actions column">
              <button className="btn-primary large" onClick={resetFlow}>
                Make Another Payment
              </button>
              <button className="btn-secondary large" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container payment-page">
        <div className="payment-header">
          <h1>Make a Payment</h1>
          <p>Follow the secure steps to send money instantly.</p>
        </div>
        {renderStepContent()}
      </div>

      <style>{`
        .payment-page {
          max-width: 720px;
          margin: 0 auto;
        }

        .payment-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .payment-header h1 {
          font-size: 34px;
          color: var(--phonepe-dark);
        }

        .payment-header p {
          color: #4b5563;
          font-size: 18px;
        }

        .step-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        }

        .step-title {
          font-size: 26px;
          margin-bottom: 20px;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .option-card {
          border: none;
          border-radius: 18px;
          padding: 24px;
          background: #f8fafc;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 18px;
          transition: all 0.25s ease;
        }

        .option-card:hover {
          background: #ecfdf5;
          box-shadow: 0 12px 20px rgba(16, 185, 129, 0.15);
        }

        .option-icon {
          font-size: 36px;
        }

        .option-title {
          font-weight: 700;
        }

        .input-field {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          border: 2px solid #e5e7eb;
          font-size: 20px;
          margin-bottom: 20px;
        }
        .input-row .input-field {
          margin-bottom: 0;
        }

        .input-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .verify-btn {
          padding: 14px 20px;
          border-radius: 16px;
          border: none;
          background: #e0f2fe;
          color: #0369a1;
          font-weight: 600;
          min-width: 120px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .verify-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .verify-btn.verified {
          background: #dcfce7;
          color: #15803d;
        }

        .step-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }

        .step-actions.column {
          flex-direction: column;
        }

        .amount-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          background: #f3f4f6;
          padding: 20px;
          border-radius: 18px;
        }

        .amount-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 36px;
          font-weight: 600;
          outline: none;
        }

        .balance-hint {
          margin-top: 12px;
          color: #4b5563;
        }

        .summary-box {
          background: #f8fafc;
          padding: 20px;
          border-radius: 18px;
          margin-bottom: 18px;
          font-size: 18px;
        }

        .summary-box strong {
          display: block;
          font-size: 22px;
          color: var(--phonepe-dark);
          margin-bottom: 12px;
        }

        .mpin-input {
          width: 100%;
          padding: 16px;
          font-size: 28px;
          text-align: center;
          letter-spacing: 12px;
          border-radius: 18px;
          border: 2px solid #e5e7eb;
          margin-bottom: 20px;
        }

        .result-card {
          text-align: center;
        }

        .result-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 15px;
          font-size: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .result-icon.success {
          background: #dcfce7;
          color: #16a34a;
        }

        .result-icon.failure {
          background: #fee2e2;
          color: #dc2626;
        }

        .confirm-text {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 24px;
          color: var(--phonepe-dark);
        }

        @media (max-width: 640px) {
          .step-card {
            padding: 24px;
          }

          .step-actions {
            flex-direction: column;
          }

          .input-row {
            flex-direction: column;
          }

          .verify-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default MakePaymentPage;

