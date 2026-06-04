/**
 * @file App.js
 * @description ProcureAI — Root Application with Role-Specific Dashboard Routing
 *
 * Role UX Matrix:
 * ┌───────────────┬────────────────────────────────────────────────────────────┐
 * │ Role          │ Dashboard Experience                                       │
 * ├───────────────┼────────────────────────────────────────────────────────────┤
 * │ Owner         │ Full access: System Overview panel + Inventory + Vendors   │
 * │               │ + Purchase Orders. Purple accent badge. Analytics visible. │
 * ├───────────────┼────────────────────────────────────────────────────────────┤
 * │ Manager       │ Operational access: Inventory + Vendors + Purchase Orders. │
 * │               │ Blue accent badge. Write actions fully enabled.            │
 * ├───────────────┼────────────────────────────────────────────────────────────┤
 * │ Validator     │ Read-only audit access: Inventory (view) + Purchase Orders │
 * │               │ (view). No Vendors. No consume/create actions. Amber badge.│
 * └───────────────┴────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import InventoryDashboard from './component/InventoryDashboard';
import VendorManagement from './component/VendorManagement';
import PurchaseOrders from './component/PurchaseOrders';
import Login from './component/Login';
import Home from './pages/home';
import {
  Layers,
  Users,
  FileText,
  LogOut,
  ShieldCheck,
  Crown,
  BarChart3,
  Eye,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Package,
} from 'lucide-react';

// ─── LOGO COMPONENT ───────────────────────────────────────────────────────────
const Logo = ({ light = false }) => (
  <div className="flex items-center gap-2.5">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${light ? 'bg-white/10' : 'bg-indigo-600'}`}>
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6" />
        <path d="M21.34 15.57a10 10 0 1 1-.57-8.38" />
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
    <div className="flex flex-col leading-none">
      <span className={`text-sm font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        ProcureAI
      </span>
      <span className={`text-[9px] font-semibold uppercase tracking-widest mt-0.5 ${light ? 'text-white/40' : 'text-slate-400'}`}>
        Procurement Platform
      </span>
    </div>
  </div>
);

// ─── ROLE CONFIG — defines nav tabs, accent colour, and welcome message ───────
const ROLE_CONFIG = {
  Owner: {
    badge: 'bg-purple-100 text-purple-700 border border-purple-200',
    badgeIcon: Crown,
    accentClass: 'bg-purple-600',
    activeTab: 'bg-purple-600 text-white shadow-lg shadow-purple-900/20',
    label: 'System Owner',
    welcomeTitle: 'Owner Command Centre',
    welcomeDesc: 'Full system control — telemetry, RBAC, spend analytics, and all operations.',
    defaultTab: 'overview',
    tabs: [
      { id: 'overview',   label: 'System Overview',  icon: BarChart3 },
      { id: 'inventory',  label: 'Inventory',         icon: Layers    },
      { id: 'vendors',    label: 'Vendors',           icon: Users     },
      { id: 'orders',     label: 'Purchase Orders',   icon: FileText  },
    ],
  },
  Manager: {
    badge: 'bg-blue-100 text-blue-700 border border-blue-200',
    badgeIcon: ShieldCheck,
    accentClass: 'bg-blue-600',
    activeTab: 'bg-blue-600 text-white shadow-lg shadow-blue-900/20',
    label: 'Operations Manager',
    welcomeTitle: 'Manager Operations Hub',
    welcomeDesc: 'Manage stock consumption, vendor relationships, and purchase order pipeline.',
    defaultTab: 'inventory',
    tabs: [
      { id: 'inventory', label: 'Inventory',        icon: Layers   },
      { id: 'vendors',   label: 'Vendors',           icon: Users    },
      { id: 'orders',    label: 'Purchase Orders',   icon: FileText },
    ],
  },
  Validator: {
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    badgeIcon: Eye,
    accentClass: 'bg-amber-500',
    activeTab: 'bg-amber-500 text-white shadow-lg shadow-amber-900/20',
    label: 'Audit Validator',
    welcomeTitle: 'Validator Audit Console',
    welcomeDesc: 'Read-only access to inventory telemetry and purchase order status verification.',
    defaultTab: 'inventory',
    tabs: [
      { id: 'inventory', label: 'Inventory Audit', icon: Package  },
      { id: 'orders',    label: 'PO Verification', icon: FileText },
    ],
  },
};

// ─── OWNER OVERVIEW PANEL ────────────────────────────────────────────────────
// Exclusive to Owner role — shows system-level KPIs and access matrix
const OwnerOverview = ({ user }) => {
  const kpis = [
    { label: 'Automation Rate',    value: '94%',    sub: 'POs auto-generated',   icon: TrendingUp,   color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Vendors',     value: '12',     sub: 'Verified partners',     icon: Users,        color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Orders This Month',  value: '38',     sub: 'Total purchase orders', icon: FileText,     color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Alerts Resolved',    value: '100%',   sub: 'Threshold breaches',    icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const rbacAccess = [
    { role: 'Owner',     perms: ['Inventory', 'Vendors', 'Purchase Orders', 'RBAC Config', 'Analytics', 'Audit Log'], badge: 'bg-purple-100 text-purple-700' },
    { role: 'Manager',   perms: ['Inventory', 'Vendors', 'Purchase Orders'], badge: 'bg-blue-100 text-blue-700' },
    { role: 'Validator', perms: ['Inventory (Read)', 'Purchase Orders (Read)'], badge: 'bg-amber-100 text-amber-700' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-5 h-5 text-purple-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-purple-200">Owner Dashboard</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-purple-200 text-sm mt-1">{user.companyName || 'Your Company'} · Full system administrator access</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* RBAC Access Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">RBAC Access Control Matrix</h2>
          <span className="ml-auto text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold uppercase">Owner Only</span>
        </div>
        <div className="space-y-4">
          {rbacAccess.map(({ role, perms, badge }) => (
            <div key={role} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badge} w-fit`}>{role}</span>
              <div className="flex flex-wrap gap-2">
                {perms.map(p => (
                  <span key={p} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-lg font-medium">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Pipeline Status */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">AI Pipeline Status</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          {[
            { label: 'FastAPI Service', status: 'Online', color: 'text-emerald-400' },
            { label: 'RAG Agent',       status: 'Active',  color: 'text-emerald-400' },
            { label: 'PDF Parser',      status: 'Standby', color: 'text-amber-400'   },
          ].map(({ label, status, color }) => (
            <div key={label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className={`text-sm font-bold ${color}`}>{status}</div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── VALIDATOR READ-ONLY BANNER ───────────────────────────────────────────────
// Shown at the top of every Validator page as a persistent reminder
const ValidatorBanner = () => (
  <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
    <div>
      <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Validator — Read-Only Access</span>
      <p className="text-xs text-amber-700 mt-0.5">You can view and audit all records. Write operations are restricted to Owner and Manager roles.</p>
    </div>
  </div>
);

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');
  const [view, setView] = useState('home');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      // Set default tab based on role
      const config = ROLE_CONFIG[parsed.role] || ROLE_CONFIG.Manager;
      setActiveTab(config.defaultTab);
      setView('dashboard');
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    // Route to role-appropriate default tab immediately
    const config = ROLE_CONFIG[userData.role] || ROLE_CONFIG.Manager;
    setActiveTab(config.defaultTab);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('home');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading ProcureAI...</span>
        </div>
      </div>
    );
  }

  // Derive role config for current user
  const role = user?.role || 'Manager';
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.Manager;
  const BadgeIcon = config.badgeIcon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">

      {/* ── HOME PAGE ──────────────────────────────────────────────────────── */}
      {view === 'home' && (
        <Home onGetStarted={() => setView('login')} />
      )}

      {/* ── LOGIN PAGE ─────────────────────────────────────────────────────── */}
      {view === 'login' && (
        <Login onLoginSuccess={handleLoginSuccess} onBackToHome={() => setView('home')} />
      )}

      {/* ── DASHBOARD ─────────────────────────────────────────────────────── */}
      {view === 'dashboard' && user && (
        <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-50">

          {/* ══ SIDEBAR ═══════════════════════════════════════════════════════ */}
          <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 flex-shrink-0">
            <div>

              {/* Brand */}
              <div className="p-5 border-b border-slate-800">
                <Logo light={true} />
              </div>

              {/* Role badge strip */}
              <div className="px-4 pt-4 pb-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${
                  role === 'Owner'     ? 'bg-purple-900/40 text-purple-300 border border-purple-800' :
                  role === 'Manager'   ? 'bg-blue-900/40 text-blue-300 border border-blue-800' :
                                        'bg-amber-900/40 text-amber-300 border border-amber-800'
                }`}>
                  <BadgeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="uppercase tracking-wider">{config.label}</span>
                </div>
              </div>

              {/* Navigation tabs — role-specific */}
              <div className="px-3 pt-2 pb-4">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block mb-2 px-2">
                  Navigation
                </span>
                <nav className="space-y-1">
                  {config.tabs.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      id={`sidebar-tab-${id}`}
                      onClick={() => setActiveTab(id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        activeTab === id
                          ? config.activeTab
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Role-specific info block */}
              <div className="mx-3 mb-4 p-3 bg-slate-800 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-400 leading-relaxed">{config.welcomeDesc}</p>
              </div>
            </div>

            {/* User profile + logout */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                  role === 'Owner'   ? 'bg-purple-600' :
                  role === 'Manager' ? 'bg-blue-600'   : 'bg-amber-500'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider truncate flex items-center gap-1 ${
                    role === 'Owner'   ? 'text-purple-400' :
                    role === 'Manager' ? 'text-blue-400'   : 'text-amber-400'
                  }`}>
                    <BadgeIcon className="w-3 h-3" />
                    {role}
                  </div>
                </div>
              </div>
              <button
                id="sidebar-logout-btn"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* ══ MAIN CONTENT AREA ════════════════════════════════════════════ */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

            {/* Top header bar */}
            <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-6 sm:px-8 flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Role-coloured dot */}
                <span className={`w-2 h-2 rounded-full ${
                  role === 'Owner'   ? 'bg-purple-500' :
                  role === 'Manager' ? 'bg-blue-500'   : 'bg-amber-500'
                }`} />
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  {config.tabs.find(t => t.id === activeTab)?.label || activeTab}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400 font-medium hidden sm:block">
                  {user.companyName || 'B2B Enterprise'}
                </span>
                {/* Role badge in header */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${config.badge}`}>
                  <BadgeIcon className="w-3 h-3" />
                  {role}
                </span>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50">
              <div className="max-w-7xl mx-auto space-y-6">

                {/* Validator always sees the read-only banner at top */}
                {role === 'Validator' && <ValidatorBanner />}

                {/* Owner Overview — exclusive tab */}
                {activeTab === 'overview' && role === 'Owner' && (
                  <OwnerOverview user={user} />
                )}

                {/* Inventory — all roles */}
                {activeTab === 'inventory' && (
                  <InventoryDashboard user={user} />
                )}

                {/* Vendors — Owner + Manager only */}
                {activeTab === 'vendors' && (role === 'Owner' || role === 'Manager') && (
                  <VendorManagement user={user} />
                )}

                {/* Purchase Orders — all roles */}
                {activeTab === 'orders' && (
                  <PurchaseOrders user={user} />
                )}

              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
