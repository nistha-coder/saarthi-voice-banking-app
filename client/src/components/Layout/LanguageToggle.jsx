

// ========== client/src/components/Layout/LanguageToggle.jsx ==========
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, switchLanguage } = useLanguage();

  return (
    <div className="language-toggle">
      <button
        onClick={() => switchLanguage('en')}
        className={language === 'en' ? 'active' : ''}
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage('hi')}
        className={language === 'hi' ? 'active' : ''}
      >
        हिं
      </button>
    </div>
  );
};

export default LanguageToggle;