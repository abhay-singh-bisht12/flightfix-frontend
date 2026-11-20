import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Plane,
  Activity,
  ShieldCheck,
  Wrench,
  Package,
  User,
  LogOut,
  Menu,
  X,
  UserPlus,
  FileCheck2,
  Truck,
  LayoutDashboard,
  TrendingUp,
} from 'lucide-react';
import { useAuth, ROLE_LABELS, ROLES } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Master navigation list for authenticated application
  const allNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Aircraft', path: '/aircraft', icon: Plane },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Work Orders', path: '/work-orders', icon: Activity },
    { name: 'Execution', path: '/execution', icon: FileCheck2 },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Compliance', path: '/compliance', icon: ShieldCheck },
    { name: 'Supply Chain', path: '/supply-chain', icon: Truck },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: TrendingUp,
      restrictedTo: [ROLES.ADMIN, ROLES.SAFETY_OFFICER, ROLES.CONTRACTS_MANAGER],
    },
  ];

  // Filter links by user role (e.g. FIELD_TECHNICIAN excluded from management analytics)
  const visibleNavLinks = allNavLinks.filter((link) => {
    if (link.restrictedTo && role) {
      return link.restrictedTo.includes(role);
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="flex items-center space-x-2.5 group shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Plane className="w-5 h-5 text-white -rotate-45" />
              </div>
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                  Flight<span className="text-blue-500">Fix</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded shrink-0">
                  MRO
                </span>
                {!isAuthenticated && (
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline ml-1 pl-2 border-l border-slate-800">
                    Aircraft Maintenance Management
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Authenticated Desktop Navigation Links (Clean, No scrollbar, No clipping) */}
          {isAuthenticated && (
            <div className="hidden xl:flex items-center space-x-1 flex-1 justify-center px-2">
              {visibleNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Section: User Profile & Controls (NO technical telemetry / NO WiFi indicator) */}
          <div className="hidden sm:flex items-center space-x-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 shrink-0">
                <div className="flex flex-col items-end text-right shrink-0">
                  <span className="text-xs font-bold text-white max-w-[130px] truncate leading-tight">
                    {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 leading-tight">
                    {ROLE_LABELS[role] || role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-300 border border-slate-700/80 hover:border-rose-500/40 transition-colors shrink-0"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                </button>
              </div>
            ) : (
              /* Public Navbar Right: Clean Sign In & Register buttons */
              <div className="flex items-center space-x-2.5 shrink-0">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile / Tablet Menu Button (trigger below xl breakpoint) */}
          <div className="flex xl:hidden items-center space-x-2 shrink-0">
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

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-4 space-y-2">
          {isAuthenticated ? (
            /* Authenticated Drawer */
            <>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs font-bold text-white">
                    {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username} (@{user?.username})
                  </div>
                  <div className="text-[11px] text-blue-400 font-semibold">{ROLE_LABELS[role] || role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs border border-rose-500/30"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>

              <div className="space-y-1">
                {visibleNavLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                        active
                          ? 'bg-blue-600/20 text-blue-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            /* Public Drawer: ONLY Sign In & Register */
            <div className="py-2 space-y-2">
              <p className="text-xs text-slate-400 px-1 mb-2">
                Aviation Maintenance Management & Regulatory Compliance
              </p>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <User className="w-4 h-4 text-blue-400" />
                <span>Sign In to Workspace</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create FlightFix Account</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
