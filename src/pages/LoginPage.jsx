import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, Lock, User, AlertCircle, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState(location.state?.username || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Destination after login (default /dashboard)
  const from = location.state?.from?.pathname || '/dashboard';

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setFieldErrors((prev) => ({ ...prev, username: 'Username or email is required.' }));
      return;
    }
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password is required.' }));
      return;
    }

    setLoading(true);

    try {
      await login(trimmedUsername, password);
      navigate(from, { replace: true });
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
          // Field-specific errors
          setFieldErrors(data);
          if (data.username) setErrorMessage(Array.isArray(data.username) ? data.username[0] : data.username);
          else if (data.password) setErrorMessage(Array.isArray(data.password) ? data.password[0] : data.password);
          else setErrorMessage('Authentication failed. Please verify your credentials.');
        }
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('Network Error')) {
        setErrorMessage('Unable to connect to FlightFix authentication authority. Please verify network connectivity.');
      } else {
        setErrorMessage(err.message || 'An unexpected authentication error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/30">
            <Plane className="w-7 h-7 text-white -rotate-45" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Sign in to Flight<span className="text-blue-500">Fix</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Aviation Maintenance Operations & Compliance Portal
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500"></div>

          {/* Registration Success Banner */}
          {location.state?.registrationSuccess && !errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start space-x-3 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold block text-emerald-200">Account created successfully!</span>
                <span className="text-slate-300">Please sign in with your password to access your FlightFix workspace.</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. tech_test_01 or engineer@airline.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border ${
                    fieldErrors.username ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500'
                  } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors`}
                  disabled={loading}
                />
              </div>
              {fieldErrors.username && (
                <p className="mt-1.5 text-[11px] text-rose-400">{fieldErrors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border ${
                    fieldErrors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500'
                  } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-[11px] text-rose-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-test credential helper */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Verified Test Account</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('tech_test_01');
                setPassword('TestPassword123!');
              }}
              className="w-full text-left p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 flex items-center justify-between group transition-colors"
            >
              <div>
                <span className="font-mono text-blue-400 font-semibold">tech_test_01</span>
                <span className="text-slate-500 text-[11px] ml-2">(Role: FIELD_TECHNICIAN)</span>
              </div>
              <span className="text-[11px] text-slate-400 group-hover:text-white">Auto-fill &rarr;</span>
            </button>
          </div>
        </div>

        {/* Footer Link to Register */}
        <div className="text-center text-xs text-slate-400">
          <span>Need maintenance personnel access? </span>
          <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}
