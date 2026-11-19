import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Plane,
  Activity,
  ShieldCheck,
  Wrench,
  Package,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
  UserPlus,
  Shield,
  FileCheck2,
  Truck,
  LayoutDashboard,
  TrendingUp
} from 'lucide-react';
import { checkBackendHealth } from '../../api/health';
import { useAuth, ROLE_LABELS } from '../../context/AuthContext';
import StatusBadge from './StatusBadge';

export default function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const [health, setHealth] = useState({ status: 'checking', latency: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then((res) => {
      if (isMounted) {
        if (res.success) {
          setHealth({ status: 'online', latency: res.latency });
        } else {
          setHealth({ status: 'offline', error: res.error });
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Aircraft Fleet', path: '/aircraft', icon: Plane },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Work Orders', path: '/work-orders', icon: Activity },
    { name: 'Execution', path: '/execution', icon: FileCheck2 },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Compliance', path: '/compliance', icon: ShieldCheck },
    { name: 'Supply Chain', path: '/supply-chain', icon: Truck },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <Plane className="w-5 h-5 text-white -rotate-45" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-bold tracking-tight text-white">Flight<span className="text-blue-500">Fix</span></span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">MRO</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Aircraft Maintenance Management</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section: Telemetry & User Controls */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* Live Backend Connection Indicator */}
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-mono border ${
                health.status === 'online'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : health.status === 'checking'
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
              }`}
              title="Render Live Backend API"
            >
              {health.status === 'online' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Backend: Live ({health.latency}ms)</span>
                </>
              ) : health.status === 'checking' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Backend: Standby</span>
                </>
              )}
            </div>

            {/* Authenticated User Status or Sign In / Register Buttons */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <div className="flex flex-col items-end text-right">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">@{user.username}</span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-300 border border-slate-700/80 hover:border-rose-500/40 transition-colors"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-4 space-y-2">
          {isAuthenticated && user && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between mb-2">
              <div>
                <div className="text-xs font-bold text-white">
                  {user.first_name} {user.last_name} (@{user.username})
                </div>
                <div className="text-[11px] text-blue-400 font-semibold">{ROLE_LABELS[role] || role}</div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs border border-rose-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-blue-600/20 text-blue-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {!isAuthenticated && (
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
