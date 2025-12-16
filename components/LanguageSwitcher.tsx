import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from './ui/shadcn';

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-gray-400 hover:bg-slate-800/50 hover:text-gray-300 transition-colors w-full justify-center"
      title={t('settings.switchLanguage')}
    >
      <Globe size={18} />
      <span className="text-sm font-medium uppercase">{i18n.language}</span>
    </Button>
  );
};
