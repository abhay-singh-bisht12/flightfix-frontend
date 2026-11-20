import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plane,
  User,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Activity,
  Package,
  Clock,
  Shield,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/auth';

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successData, setSuccessData] = useState(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !successData) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, successData, navigate]);

  // Handle successful registration auto-redirect to login
  useEffect(() => {
    if (successData) {
      const timer = setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            registrationSuccess: true,
            username: formData.username.trim(),
          },
        });
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [successData, navigate, formData.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required.';
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required.';
    }
    if (!formData.username.trim()) {
      errors.username = 'Username is required.';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_@+.-]+$/.test(formData.username.trim())) {
      errors.username = 'Username may only contain letters, numbers, and @/./+/-/_ characters.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid corporate email address.';
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        errors.phone = 'Enter a valid phone number (7-20 digits, optional leading +).';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!formData.confirm_password) {
      errors.confirm_password = 'Confirm password is required.';
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage('');
    setFieldErrors({});

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setLoading(true);

    try {
      // Use authApi directly to create the account without logging in immediately
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
      };

      const result = await authApi.register(payload);
      setSuccessData(result);
    } catch (err) {
      console.error('Registration failed:', err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          setErrorMessage(data);
        } else if (data.non_field_errors) {
          setErrorMessage(
            Array.isArray(data.non_field_errors)
              ? data.non_field_errors.join(' ')
              : data.non_field_errors
          );
        } else if (data.detail) {
          setErrorMessage(data.detail);
        } else {
          // Flatten field errors from Django serializer
          const parsedErrors = {};
          Object.keys(data).forEach((key) => {
            parsedErrors[key] = Array.isArray(data[key])
              ? data[key].join(' ')
              : data[key];
          });
          setFieldErrors(parsedErrors);
          setErrorMessage('Please correct the highlighted fields below.');
        }
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('Network Error')) {
        setErrorMessage(
          'Unable to reach FlightFix authentication service. Please verify your connection.'
        );
      } else {
        setErrorMessage(err.message || 'An unexpected registration error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualProceedToLogin = () => {
    navigate('/login', {
      replace: true,
      state: {
        registrationSuccess: true,
        username: formData.username.trim(),
      },
    });
  };

  // SUCCESS STATE VIEW
  if (successData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 animate-in fade-in duration-300">
        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Account Created Successfully
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Welcome to FlightFix,{' '}
              <strong className="text-white">
                {formData.first_name} {formData.last_name}
              </strong>
              . Your workspace profile has been established.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-400 space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Username:</span>
              <span className="text-white font-semibold">{formData.username.trim()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="text-slate-300">{formData.email.trim().toLowerCase()}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800/60">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready to Sign In</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleManualProceedToLogin}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
              <span>Redirecting to Sign In in a few seconds...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // REGISTRATION FORM VIEW
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: FlightFix Branding & Benefits Overview (Desktop) */}
        <div className="lg:col-span-5 space-y-6 hidden lg:block pr-2">
          {/* Brand header */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-500/20">
                <Plane className="w-6 h-6 text-white -rotate-45" />
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight">
                  Flight<span className="text-blue-500">Fix</span>
                </span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                  MRO Platform
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
              Enterprise Aircraft Maintenance & Airworthiness Management
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed for certified repair stations, commercial operators, and military squadrons to streamline maintenance workflows and regulatory compliance.
            </p>
          </div>

          {/* Benefits Feature Highlights */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3 hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Plane className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Aircraft & Fleet Management</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Real-time airworthiness tracking, serial records, flight hours, and cycle threshold triggers.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3 hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Maintenance & Work Orders</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Structured inspection intervals, priority work orders, and digital execution sign-offs.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3 hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Compliance & Spare Parts</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  FAA & EASA directive compliance, rotable inventory, and warehouse tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Security footnote */}
          <div className="pt-2 flex items-center space-x-2 text-[11px] text-slate-400">
            <Shield className="w-4 h-4 text-blue-400 shrink-0" />
            <span>FAA Part 145 & EASA Compliant Security Architecture</span>
          </div>
        </div>

        {/* Right Column: Registration Form Card */}
        <div className="lg:col-span-7 w-full">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500" />

            {/* Form Header */}
            <div className="mb-6 space-y-1.5">
              {/* Mobile-only logo indicator */}
              <div className="flex items-center space-x-2 mb-2 lg:hidden">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Plane className="w-4 h-4 text-white -rotate-45" />
                </div>
                <span className="text-base font-bold text-white">
                  Flight<span className="text-blue-500">Fix</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Create your FlightFix account
              </h1>
              <p className="text-xs text-slate-400">
                Aviation maintenance operations and regulatory compliance workspace
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    First Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="e.g. Sarah"
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                      fieldErrors.first_name
                        ? 'border-rose-500'
                        : 'border-slate-800 focus:border-blue-500'
                    } text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                    disabled={loading}
                  />
                  {fieldErrors.first_name && (
                    <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Last Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="e.g. Connor"
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                      fieldErrors.last_name
                        ? 'border-rose-500'
                        : 'border-slate-800 focus:border-blue-500'
                    } text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                    disabled={loading}
                  />
                  {fieldErrors.last_name && (
                    <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Username & Corporate Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      autoComplete="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="e.g. sconnor"
                      className={`w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border ${
                        fieldErrors.username
                          ? 'border-rose-500'
                          : 'border-slate-800 focus:border-blue-500'
                      } text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-mono`}
                      disabled={loading}
                    />
                  </div>
                  {fieldErrors.username && (
                    <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Corporate Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="sconnor@airline.com"
                      className={`w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border ${
                        fieldErrors.email
                          ? 'border-rose-500'
                          : 'border-slate-800 focus:border-blue-500'
                      } text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                      disabled={loading}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Phone Number (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Phone Number <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1-555-0144"
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border ${
                      fieldErrors.phone
                        ? 'border-rose-500'
                        : 'border-slate-800 focus:border-blue-500'
                    } text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-mono`}
                    disabled={loading}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Row 4: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className={`w-full pl-9 pr-10 py-2 rounded-xl bg-slate-950 border ${
                        fieldErrors.password
                          ? 'border-rose-500'
                          : 'border-slate-800 focus:border-blue-500'
                      } text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirm_password"
                      autoComplete="new-password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className={`w-full pl-9 pr-10 py-2 rounded-xl bg-slate-950 border ${
                        fieldErrors.confirm_password
                          ? 'border-rose-500'
                          : 'border-slate-800 focus:border-blue-500'
                      } text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirm_password && (
                    <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.confirm_password}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Navigation */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
              <span>Already have an account? </span>
              <Link
                to="/login"
                className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
