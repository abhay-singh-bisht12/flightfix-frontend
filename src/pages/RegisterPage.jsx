import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, User, Mail, Lock, Phone, ShieldCheck, AlertCircle, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth, ROLES, ROLE_LABELS } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: ROLES.FIELD_TECHNICIAN,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successData, setSuccessData] = useState(null);

  // If already authenticated and not showing success, redirect
  React.useEffect(() => {
    if (isAuthenticated && !successData) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, successData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required.';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required.';
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match.';
    }
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        errors.phone = 'Enter a valid phone number (7-20 digits, optional leading +).';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        role: formData.role,
      });

      setSuccessData(result);
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          setErrorMessage(data);
        } else if (data.non_field_errors) {
          setErrorMessage(Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : data.non_field_errors);
        } else if (data.detail) {
          setErrorMessage(data.detail);
        } else {
          // Flatten field errors from Django serializer
          const parsedErrors = {};
          Object.keys(data).forEach((key) => {
            parsedErrors[key] = Array.isArray(data[key]) ? data[key].join(' ') : data[key];
          });
          setFieldErrors(parsedErrors);
          setErrorMessage('Please review and correct the errors below.');
        }
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('Network Error')) {
        setErrorMessage('Unable to connect to FlightFix authentication authority. Please verify network connectivity.');
      } else {
        setErrorMessage(err.message || 'An unexpected registration error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Success view
  if (successData) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Personnel Registration Approved</h2>
            <p className="text-xs text-slate-400">
              Welcome to FlightFix, <strong className="text-slate-200">{successData.user?.first_name} {successData.user?.last_name}</strong>.
              Your security clearance has been initialized with the role{' '}
              <strong className="text-blue-400">{ROLE_LABELS[successData.role] || successData.role}</strong>.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 space-y-1 text-left">
            <div>Username: <span className="text-slate-200">{successData.user?.username}</span></div>
            <div>Email: <span className="text-slate-200">{successData.user?.email}</span></div>
            <div>Status: <span className="text-emerald-400">Active &bull; JWT Authorized</span></div>
          </div>
          <button
            onClick={() => navigate('/dashboard', { replace: true })}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Proceed to Operations Cockpit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/30">
            <Plane className="w-6 h-6 text-white -rotate-45" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Register MRO Personnel
          </h1>
          <p className="text-xs text-slate-400">
            Create an authorized account to access FlightFix aircraft maintenance workflows.
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500"></div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  First Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="e.g. Sarah"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border ${
                    fieldErrors.first_name ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                  } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                  disabled={loading}
                />
                {fieldErrors.first_name && (
                  <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Last Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Connor"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border ${
                    fieldErrors.last_name ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                  } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                  disabled={loading}
                />
                {fieldErrors.last_name && (
                  <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.last_name}</p>
                )}
              </div>
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border ${
                      fieldErrors.username ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                    } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                    disabled={loading}
                  />
                </div>
                {fieldErrors.username && (
                  <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border ${
                      fieldErrors.email ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                    } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                    disabled={loading}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            {/* Phone & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone Number <span className="text-slate-500 font-normal">(Optional)</span>
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
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border ${
                      fieldErrors.phone ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                    } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                    disabled={loading}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  MRO Role Clearance <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    disabled={loading}
                  >
                    <option value={ROLES.FIELD_TECHNICIAN}>{ROLE_LABELS.FIELD_TECHNICIAN}</option>
                    <option value={ROLES.SAFETY_OFFICER}>{ROLE_LABELS.SAFETY_OFFICER}</option>
                    <option value={ROLES.CONTRACTS_MANAGER}>{ROLE_LABELS.CONTRACTS_MANAGER}</option>
                    <option value={ROLES.ADMIN}>{ROLE_LABELS.ADMIN}</option>
                  </select>
                </div>
                {fieldErrors.role && (
                  <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.role}</p>
                )}
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border ${
                      fieldErrors.password ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                    } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirm_password"
                    autoComplete="new-password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border ${
                      fieldErrors.confirm_password ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                    } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                    disabled={loading}
                  />
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
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Authorizing & Registering...</span>
                  </>
                ) : (
                  <>
                    <span>Create Authorized Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Link to Login */}
        <div className="text-center text-xs text-slate-400">
          <span>Already have an authorized FlightFix account? </span>
          <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
