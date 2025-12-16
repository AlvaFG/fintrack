import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/shadcn';
import { Eye, EyeOff, Check, X as XIcon, AlertCircle } from 'lucide-react';

const AuthPage = () => {
  const { t } = useTranslation();
  const { signIn, signUp, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  // Form States
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    console.log('[AuthPage] isAuthenticated changed:', isAuthenticated);
    if (isAuthenticated) {
      console.log('[AuthPage] User is authenticated, navigating to /');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Password Strength Logic
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(registerData.password);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!loginData.email) newErrors.email = t('validation.required');
    else if (!validateEmail(loginData.email)) newErrors.email = t('validation.invalidEmail');
    
    if (!loginData.password) newErrors.password = t('validation.required');

    setErrors(newErrors);
    setAuthError('');

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      console.log('Attempting login with:', loginData.email);
      
      try {
        const result = await signIn(loginData.email, loginData.password);
        console.log('Login result:', result);
        
        if (result.error) {
          console.error('Login error:', result.error);
          if (result.error === 'Invalid login credentials') {
            setAuthError(t('validation.invalidEmail'));
          } else if (result.error.includes('Email not confirmed')) {
            setAuthError(t('auth.confirmEmail'));
          } else {
            setAuthError(result.error);
          }
        } else {
          console.log('[AuthPage] Login successful, result:', result);
          console.log('[AuthPage] Current isAuthenticated value:', isAuthenticated);
          console.log('[AuthPage] Navigating to /');
          navigate('/');
        }
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setAuthError('Error inesperado: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!registerData.name) newErrors.name = t('validation.required');
    
    if (!registerData.email) newErrors.email = t('validation.required');
    else if (!validateEmail(registerData.email)) newErrors.email = t('validation.invalidEmail');

    if (!registerData.password) newErrors.password = t('validation.required');
    else if (registerData.password.length < 8) newErrors.password = t('validation.passwordTooShort');

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsDontMatch');
    }

    if (!registerData.terms) newErrors.terms = t('validation.required');

    setErrors(newErrors);
    setAuthError('');

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      const { data, error } = await signUp(registerData.email, registerData.password, registerData.name);
      setIsLoading(false);
      
      if (error) {
        setAuthError(error.includes('already registered') 
          ? t('auth.emailAlreadyRegistered') 
          : error);
      } else if (data?.session) {
        // Auto-login exitoso - redirigir al dashboard
        console.log('Registro exitoso, redirigiendo...');
        navigate('/');
      } else if (data?.user && !data?.session) {
        // Caso donde se requiere confirmación de email (configuración de Supabase)
        setShowEmailConfirmation(true);
      }
    }
  };

  // Email confirmation screen
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">¡Revisa tu email!</h2>
            <p className="text-gray-600">
              Hemos enviado un correo de confirmación a <strong>{registerData.email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Por favor, haz clic en el enlace del correo para activar tu cuenta y poder iniciar sesión.
            </p>
            <div className="pt-4">
              <Button 
                onClick={() => {
                  setShowEmailConfirmation(false);
                  setActiveTab('login');
                  setRegisterData({ name: '', email: '', password: '', confirmPassword: '', terms: false });
                }}
                className="w-full"
              >
                Volver a Iniciar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary animate-in fade-in zoom-in-95 duration-300">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-md">
              FT
            </div>
          </div>
          <CardTitle className="text-2xl text-primary font-bold tracking-tight">FinTrack Pro</CardTitle>
          <p className="text-gray-500 mt-2 text-sm">{t('auth.subtitle')}</p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setErrors({}); }}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">{t('auth.signIn')}</TabsTrigger>
              <TabsTrigger value="register">{t('auth.signUp')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <Input 
                  label={t('auth.email')} 
                  type="email" 
                  placeholder={t('auth.emailExamplePlaceholder')} 
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  error={errors.email}
                />
                <div className="relative">
                  <Input 
                    label={t('auth.password')} 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    error={errors.password}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    {t('auth.rememberMe')}
                  </label>
                  <a href="#" className="text-secondary hover:underline font-medium transition-colors">
                    {t('auth.forgotPassword')}
                  </a>
                </div>

                {authError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                    <AlertCircle size={16} />
                    <span>{authError}</span>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  {t('auth.signIn')}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">{t('auth.orContinueWith')}</span>
                  </div>
                </div>
                
                <div className="text-center text-sm">
                  <span className="text-gray-500">{t('auth.dontHaveAccount')} </span>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('register')} 
                    className="text-primary font-semibold hover:underline"
                  >
                    {t('auth.signUp')}
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <Input 
                  label={t('auth.fullName')} 
                  placeholder={t('auth.fullNamePlaceholder')} 
                  value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  error={errors.name}
                />
                
                <Input 
                  label={t('auth.email')} 
                  type="email" 
                  placeholder={t('auth.emailExamplePlaceholder')} 
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  error={errors.email}
                />

                <div className="space-y-1">
                  <div className="relative">
                    <Input 
                      label={t('auth.password')} 
                      type={showPassword ? "text" : "password"} 
                      placeholder={t('auth.createPassword')} 
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      error={errors.password}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {registerData.password && (
                    <div className="space-y-1 mt-2">
                      <div className="flex gap-1 h-1.5 w-full">
                        <div className={`h-full rounded-full flex-1 transition-all ${passwordStrength >= 1 ? 'bg-red-400' : 'bg-gray-200'}`}></div>
                        <div className={`h-full rounded-full flex-1 transition-all ${passwordStrength >= 2 ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
                        <div className={`h-full rounded-full flex-1 transition-all ${passwordStrength >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        <div className={`h-full rounded-full flex-1 transition-all ${passwordStrength >= 4 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
                      </div>
                      <p className="text-xs text-right text-gray-500">
                        {passwordStrength < 2 ? t('auth.passwordWeak') : passwordStrength < 4 ? t('auth.passwordMedium') : t('auth.passwordStrong')}
                      </p>
                    </div>
                  )}
                </div>

                <Input 
                  label={t('auth.confirmPassword')} 
                  type="password" 
                  placeholder={t('auth.repeatPassword')} 
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  error={errors.confirmPassword}
                />
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-start gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      id="terms"
                      className="mt-1 rounded border-gray-300 text-primary focus:ring-primary" 
                      checked={registerData.terms}
                      onChange={(e) => setRegisterData({...registerData, terms: e.target.checked})}
                    />
                    <label htmlFor="terms" className="text-gray-600 leading-tight cursor-pointer">
                      {t('auth.acceptTerms')} <a href="#" className="text-primary hover:underline">{t('auth.termsAndConditions')}</a> {t('auth.andThe')} {t('auth.privacyPolicy')}.
                    </label>
                  </div>
                  {errors.terms && <p className="text-xs text-red-500 ml-6">{errors.terms}</p>}
                </div>

                {authError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                    <AlertCircle size={16} />
                    <span>{authError}</span>
                  </div>
                )}

                <Button type="submit" className="w-full mt-4" size="lg" isLoading={isLoading} disabled={isLoading}>
                  Crear Cuenta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;