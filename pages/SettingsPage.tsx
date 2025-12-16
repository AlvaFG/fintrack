import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../App';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Input,
  Label,
  Select,
  Skeleton,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator
} from '../components/ui/shadcn';
import { 
  User, 
  Lock, 
  Globe, 
  DollarSign, 
  Bell, 
  Database,
  Save,
  Camera
} from 'lucide-react';
import type { Currency } from '../types';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, settings, updateSettings, updateProfile, loading } = useApp();
  const [isSaving, setIsSaving] = useState(false);

  // Estados del formulario
  const [profileForm, setProfileForm] = useState({
    fullName: profile?.fullName || '',
    email: user?.email || '',
  });

  const [preferencesForm, setPreferencesForm] = useState({
    currency: settings?.currency || 'USD' as Currency,
    dateFormat: settings?.dateFormat || 'DD/MM/YYYY',
    language: settings?.language || 'es',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Actualizar formularios cuando cambie la data
  useEffect(() => {
    if (profile) {
      setProfileForm({ fullName: profile.fullName || '', email: user?.email || '' });
    }
  }, [profile, user]);

  useEffect(() => {
    if (settings) {
      setPreferencesForm({
        currency: settings.currency,
        dateFormat: settings.dateFormat,
        language: settings.language,
      });
    }
  }, [settings]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ fullName: profileForm.fullName });
      alert(t('settings.profileUpdated'));
    } catch (error: any) {
      alert(`${t('messages.error')}: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        currency: preferencesForm.currency,
        dateFormat: preferencesForm.dateFormat as any,
        language: preferencesForm.language as any,
        theme: 'light',
      });
      // Cambiar idioma de i18n
      i18n.changeLanguage(preferencesForm.language);
      alert(t('settings.settingsSaved'));
    } catch (error: any) {
      alert(`${t('messages.errorOccurred')}: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-500 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.personalInformation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nombre */}
          <div className="grid gap-2">
            <Label htmlFor="fullName">{t('settings.fullName')}</Label>
            <Input
              id="fullName"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              placeholder={t('settings.fullNamePlaceholder')}
            />
          </div>

          {/* Email (solo lectura) */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profileForm.email}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500">
              {t('settings.emailCannotBeModified')}
            </p>
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
            <Save size={16} />
            {isSaving ? t('settings.saving') : t('settings.saveChanges')}
          </Button>
        </CardContent>
      </Card>

      {/* Preferencias Generales */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.generalPreferences')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Moneda */}
          <div className="grid gap-2">
            <Label htmlFor="currency">{t('settings.defaultCurrency')}</Label>
            <Select
              id="currency"
              value={preferencesForm.currency}
              onChange={(e) => setPreferencesForm({ ...preferencesForm, currency: e.target.value as Currency })}
              options={[
                { value: 'USD', label: `🇺🇸 USD - ${t('settings.currencies.usd')}` },
                { value: 'EUR', label: `🇪🇺 EUR - ${t('settings.currencies.eur')}` },
                { value: 'ARS', label: `🇦🇷 ARS - ${t('settings.currencies.ars')}` },
                { value: 'MXN', label: `🇲🇽 MXN - ${t('settings.currencies.mxn')}` },
                { value: 'COP', label: `🇨🇴 COP - ${t('settings.currencies.cop')}` },
                { value: 'CLP', label: `🇨🇱 CLP - ${t('settings.currencies.clp')}` },
                { value: 'BRL', label: `🇧🇷 BRL - ${t('settings.currencies.brl')}` },
              ]}
            />
          </div>

          {/* Formato de fecha */}
          <div className="grid gap-2">
            <Label htmlFor="dateFormat">{t('common.date')}</Label>
            <Select
              id="dateFormat"
              value={preferencesForm.dateFormat}
              onChange={(e) => setPreferencesForm({ ...preferencesForm, dateFormat: e.target.value as any })}
              options={[
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (15/12/2025)' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/15/2025)' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-15)' },
              ]}
            />
          </div>

          {/* Idioma */}
          <div className="grid gap-2">
            <Label htmlFor="language">{t('settings.language')}</Label>
            <Select
              id="language"
              value={preferencesForm.language}
              onChange={(e) => setPreferencesForm({ ...preferencesForm, language: e.target.value as any })}
              options={[
                { value: 'es', label: `🇪🇸 ${t('settings.languages.es')}` },
                { value: 'en', label: `🇬🇧 ${t('settings.languages.en')}` },
              ]}
            />
          </div>

          <Button onClick={handleSavePreferences} disabled={isSaving} className="gap-2">
            <Save size={16} />
            {isSaving ? t('settings.saving') : t('settings.savePreferences')}
          </Button>
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.changePassword')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">{t('settings.currentPassword')}</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">{t('settings.confirmNewPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <Button disabled className="gap-2">
            <Lock size={16} />
            {t('settings.changePasswordButton')}
          </Button>
        </CardContent>
      </Card>

      {/* Zona de Peligro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">{t('settings.dangerZone')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">{t('settings.deleteAllData')}</h4>
            <p className="text-sm text-red-700 mb-4">
              {t('settings.deleteWarning')}
            </p>
            <Button variant="danger" disabled className="gap-2">
              <Database size={16} />
              {t('settings.deleteAllDataButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
