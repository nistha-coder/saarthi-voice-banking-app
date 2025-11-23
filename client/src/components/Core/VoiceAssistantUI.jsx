
// client/src/components/Assistant/VoiceAssistantUI.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import MpinModal from './MpinModel';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import api from '../../utils/api';

const SENSITIVE_INTENTS = new Set(['check_balance', 'view_fd', 'view_loans', 'view_loan']);

const VoiceAssistantUI = ({ onClose }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    isListening,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [userQuery, setUserQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const [showMpinModal, setShowMpinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const transcriptHandledRef = useRef(false);

  // When speech is complete, process the transcript automatically
  useEffect(() => {
    if (transcript && !isListening && transcript.trim()) {
      if (!transcriptHandledRef.current) {
        transcriptHandledRef.current = true;
        setUserQuery(transcript);
        handleQuery(transcript);
      }
    }

    // Reset when listening starts again
    if (isListening) {
      transcriptHandledRef.current = false;
      setUserQuery('');
      setAssistantResponse('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, isListening]);

  const handleStartListening = () => {
    resetTranscript();
    setUserQuery('');
    setAssistantResponse('');
    startListening();
  };

  const handleQuery = async (query) => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const response = await api.post('/assistant/ask', {
        queryText: query,
        language,
        userId: user?.userId
      });

      const { type, textResponse, target, requiresMpin, data } = response.data;

      setAssistantResponse(textResponse || 'No response received');

      // Speak out loud
      if ('speechSynthesis' in window && textResponse) {
        const utter = new SpeechSynthesisUtterance(textResponse);
        utter.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      }

      if (type === 'navigation' && target) {
        setTimeout(() => {
          navigate(target);
          onClose?.();
        }, 1400);
      }

      if (requiresMpin) {
        setPendingAction({ type, data });
        setShowMpinModal(true);
      }

    } catch (error) {
      console.error('Query error:', error);
      setAssistantResponse('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMpinVerified = async (mpin) => {
    if (!pendingAction) return;

    setShowMpinModal(false);
    setLoading(true);

    try {
      const resp = await api.post('/assistant/complete-sensitive', {
        userId: user.userId,
        action: pendingAction.type,
        data: pendingAction.data,
        mpin
      });

      const textResp = resp.data?.textResponse || 'Done';
      setAssistantResponse(textResp);

      // Speak it
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(textResp);
        utter.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      }
    } catch (err) {
      console.error('Error completing sensitive action:', err);
      setAssistantResponse('Failed to complete action.');
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="voice-assistant-modal">
        <div className="modal-overlay" onClick={onClose} />
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2>Speech Recognition Not Supported</h2>
          <p>Please use Chrome, Edge, or Safari.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-assistant-modal">
      <div className="modal-overlay" onClick={onClose} />

      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="assistant-header">
          <h2>{t('voiceAssistant.greeting')}</h2>
          <p className="language-indicator">
            Listening in: {language === 'hi' ? 'हिंदी' : 'English'}
          </p>
        </div>

        <div className="assistant-conversation">
          {userQuery && (
            <div className="message user-message">
              <strong>You:</strong> {userQuery}
            </div>
          )}

          {assistantResponse && (
            <div className="message assistant-message">
              <strong>Assistant:</strong> {assistantResponse}
            </div>
          )}

          {speechError && (
            <div className="message error-message">
              <strong>Error:</strong> {speechError}
            </div>
          )}
        </div>

        <div className="assistant-controls">
          {isListening ? (
            <div className="listening-state">
              <div className="pulse-animation">
                <FaMicrophone size={40} />
              </div>
              <p className="status-text">{t('voiceAssistant.listening')}</p>
              <button onClick={stopListening} className="btn-stop">
                <FaStop /> Stop Listening
              </button>
            </div>
          ) : loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>{t('voiceAssistant.processing')}</p>
            </div>
          ) : (
            <button onClick={handleStartListening} className="btn-listen">
              <FaMicrophone /> Start Listening
            </button>
          )}
        </div>
      </div>

      {showMpinModal && (
        <MpinModal
          onVerify={handleMpinVerified}
          onClose={() => setShowMpinModal(false)}
        />
      )}
    </div>
  );
};

export default VoiceAssistantUI;
