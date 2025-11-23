import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Layout/Navbar';
import { FaQuestionCircle, FaSearch, FaVolumeUp, FaStop, FaMicrophone } from 'react-icons/fa';
import api from '../utils/api';

const FaqPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage(); 
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef(null);

  const faqList = [
    {
      question: "How to link my ATM card?",
      answer: "Go to Dashboard → Click 'Link ATM' → Enter your card details → Verify with OTP"
    },
    {
      question: "How to set mPIN?",
      answer: "After linking your ATM, you'll be prompted to set a 4-digit mPIN for security"
    },
    {
      question: "How to create UPI ID?",
      answer: "After setting mPIN, you'll be guided to create your unique UPI ID"
    },
    {
      question: "How to use voice assistant?",
      answer: "Click the microphone icon at the bottom-right corner and speak your query"
    },
    {
      question: "Voice not working?",
      answer: "Make sure microphone permissions are enabled. Switch language if needed (EN/हिं)"
    }
  ];

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);


const playTTS = (text) => {
  try {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);

    // Set language
    const langCode = language === "hi" ? "hi-IN" : "en-US";
    utter.lang = langCode;

    // 🔥 Force load voices first
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      // Find exact match
      let voice = voices.find(v => v.lang === langCode);

      // Fallback for Hindi (Chrome sometimes returns "hi_IN")
      if (!voice && language === "hi") {
        voice = voices.find(v => v.lang.toLowerCase().includes("hi"));
      }

      if (voice) {
        utter.voice = voice;
      } else {
        console.warn("⚠ No Hindi voice found, using default browser TTS");
      }

      window.speechSynthesis.speak(utter);
    };

    // Voices might not be loaded on first run
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      loadVoices();
    }

  } catch (err) {
    console.error("TTS Error:", err);
  }
};


  // 📌 Handle FAQ Ask
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setAnswer('');

    try {
      const response = await api.post('/faq/ask', { queryText: query });
      const newAnswer = response.data.answer || 'No answer found.';
      setAnswer(newAnswer);

      // 🔊 Auto play the AI answer using backend TTS
      playTTS(newAnswer);

    } catch (err) {
      console.error("FAQ error", err);
      const errMsg = "Failed to get answer. Please try again.";
      setAnswer(errMsg);
      playTTS(errMsg);
    }

    setLoading(false);
  };

  // 📌 Handle clicking a FAQ item
  const handleFaqClick = (faq) => {
    setQuery(faq.question);
    setAnswer(faq.answer);
    playTTS(faq.answer);
  };

  // 🎤 VOICE INPUT (microphone)
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setQuery(spokenText);
    };

    recognition.onerror = (e) => {
      console.error("Voice input error:", e);
    };
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <FaQuestionCircle size={40} color="#3A2C6A" />
          <h2 style={{ color: "#3A2C6A"}}>{t('Ask Your Query')}</h2>
        </div>
        
        <div className="faq-container">
          {/* Search Box */}
          <form onSubmit={handleAsk} className="faq-search">
            <input
              type="text"
              placeholder={t('faq.askQuestion')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button onClick={startVoiceInput} type="button" className="mic-button">
              <FaMicrophone />
            </button>

            <button type="submit" disabled={loading}>
              <FaSearch /> {loading ? t('common.loading') : t('faq.search')}
            </button>
          </form>

          {/* Answer Display */}
          {answer && (
            <div className="faq-answer">
              <div className="answer-header">
                <h3>Answer:</h3>

                <div className="answer-controls">
                  {isPlaying ? (
                    <button onClick={() => audioRef.current.pause()} className="speak-button stop">
                      <FaStop /> Stop
                    </button>
                  ) : (
                    <button onClick={() => playTTS(answer)} className="speak-button">
                      <FaVolumeUp /> Read Aloud
                    </button>
                  )}
                </div>
              </div>

              <p className="answer-text">{answer}</p>
            </div>
          )}

          {/* FAQ List */}
          <div className="faq-list">
            <h3>Common Questions</h3>
            {faqList.map((faq, index) => (
              <div 
                key={index} 
                className="faq-item"
                onClick={() => handleFaqClick(faq)}
              >
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
<style>{`
        .page-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
        }

        .faq-container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .faq-search {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
        }

        .faq-search input {
          flex: 1;
          padding: 12px 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }

        .faq-search button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 30px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .faq-search button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .faq-search button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .faq-answer {
          background: #e3f2fd;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid var(--primary-color);
        }

        .answer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .answer-header h3 {
          margin: 0;
          color: var(--primary-color);
        }

        .answer-controls {
          display: flex;
          gap: 10px;
        }

        .speak-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 2px solid var(--primary-color);
          border-radius: 20px;
          background: white;
          color: var(--primary-color);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .speak-button:hover {
          background: var(--primary-color);
          color: white;
        }

        .speak-button.stop {
          border-color: var(--danger-color);
          color: var(--danger-color);
          animation: pulse-speak 1.5s infinite;
        }

        .speak-button.stop:hover {
          background: var(--danger-color);
          color: white;
        }

        @keyframes pulse-speak {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .answer-text {
          line-height: 1.8;
          color: #333;
          font-size: 16px;
        }

        .language-indicator {
          margin-top: 10px;
          font-size: 13px;
          color: #666;
          font-style: italic;
        }

        .faq-list h3 {
          margin-bottom: 20px;
          color: var(--dark-color);
        }

        .faq-item {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 15px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .faq-item:hover {
          background: #e9ecef;
          transform: translateX(5px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .faq-item h4 {
          color: var(--primary-color);
          margin-bottom: 10px;
        }

        .faq-item p {
          color: #666;
          line-height: 1.6;
        }
          .mic-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border: 2px solid var(--primary-color);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
  font-size: 18px;
  color: var(--primary-color);
}

.mic-button:hover {
  background: var(--primary-color);
  color: white;
  transform: scale(1.05);
}

       `}</style>
      {/* Your styling is unchanged */}
    </div>
  );
};

export default FaqPage;
