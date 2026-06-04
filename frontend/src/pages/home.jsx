/**
 * @file home.jsx
 * @description ProcureAI — Template-aligned White Theme B2B SaaS Landing Page
 * @design Ported from the provided HTML/CSS template to React & Tailwind CSS.
 *         Clean light theme, dynamic carousel, ROI estimator, sandbox simulator,
 *         and verified B2B stock images.
 */

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Star,
  AlertCircle,
  Play,
  Pause,
  Mail,
  FileSearch,
  Check,
  Shield,
  ChevronDown,
  Users,
  Award,
  Layers,
  Settings,
  Phone,
  BarChart3,
  FileText,
  MapPin,
  Lock,
  ArrowRight,
  Crown,
  ShieldCheck,
  Eye,
  Package
} from 'lucide-react';

const Logo = ({ light = false, showSubtitle = true }) => {
  return (
    <div className="flex items-center gap-2.5">
      <svg className={`w-10 h-10 flex-shrink-0 ${light ? 'text-white' : 'text-blue-600'}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 78 A28 28 0 1 1 68 50 C68 62 60 72 48 76" />
        <path d="M40 88 A38 38 0 1 1 78 50 C78 66 66 80 50 86" strokeWidth="2.2" />
        <path d="M40 98 A48 48 0 1 1 88 50" strokeWidth="1.5" />
        <path d="M40 50v48M30 60v38M20 70v28" strokeWidth="2.5" />
        <circle cx="40" cy="50" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="40" cy="98" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="30" cy="60" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="30" cy="98" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="20" cy="70" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="20" cy="98" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="68" cy="50" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="78" cy="50" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="48" cy="22" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="50" cy="12" r="3.2" fill="currentColor" stroke="none" />
        <path d="M35 65 L60 40 M46 40 H60 V54" strokeWidth="5.5" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <div className="flex items-baseline text-base font-extrabold tracking-tight leading-none uppercase">
          <span className={light ? 'text-white' : 'text-slate-800'}>Procure</span>
          <span className="text-blue-500 ml-0.5">AI</span>
        </div>
        {showSubtitle && (
          <span className={`text-[6px] font-bold tracking-widest uppercase mt-1 leading-none ${light ? 'text-slate-500' : 'text-slate-400'}`}>
            Autonomous Procurement Network
          </span>
        )}
      </div>
    </div>
  );
};

const Home = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  // ROI Calculator State
  const [monthlySpend, setMonthlySpend] = useState(25000);
  const [manualHours, setManualHours] = useState(50);
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Role-Based Preview Sandbox State
  const [sandboxMode, setSandboxMode] = useState('pipeline'); // 'pipeline' or 'rbac'
  const [previewRole, setPreviewRole] = useState('Owner'); // 'Owner', 'Manager', 'Validator'
  const [previewTab, setPreviewTab] = useState('overview'); // 'overview', 'inventory', 'vendors', 'orders'

  const handlePreviewRoleChange = (role) => {
    setPreviewRole(role);
    if (role === 'Owner') {
      setPreviewTab('overview');
    } else {
      setPreviewTab('inventory');
    }
  };

  const renderRbacPreview = () => {
    const tabs = {
      Owner: [
        { id: 'overview', label: 'System Overview', icon: BarChart3 },
        { id: 'inventory', label: 'Inventory', icon: Layers },
        { id: 'vendors', label: 'Vendors', icon: Users },
        { id: 'orders', label: 'Purchase Orders', icon: FileText },
      ],
      Manager: [
        { id: 'inventory', label: 'Inventory', icon: Layers },
        { id: 'vendors', label: 'Vendors', icon: Users },
        { id: 'orders', label: 'Purchase Orders', icon: FileText },
      ],
      Validator: [
        { id: 'inventory', label: 'Inventory Audit', icon: Package },
        { id: 'orders', label: 'PO Verification', icon: FileText },
      ],
    };

    const currentTabs = tabs[previewRole] || tabs.Owner;
    const badgeIcons = {
      Owner: Crown,
      Manager: ShieldCheck,
      Validator: Eye,
    };
    const RoleIcon = badgeIcons[previewRole] || Crown;

    return (
      <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col text-left font-sans text-xs">
        {/* Mock Top bar */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-850">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-2">sandbox_ui_preview.app</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-850 px-3 py-1 rounded-full border border-slate-750 flex items-center gap-1.5">
              <RoleIcon className="w-3 h-3 text-blue-400" />
              {previewRole} Environment
            </span>
          </div>
        </div>

        {/* Outer Layout: Sidebar + Content */}
        <div className="flex flex-col md:flex-row min-h-[420px] bg-slate-950">
          
          {/* Mock Sidebar */}
          <div className="w-full md:w-52 bg-slate-900 border-r border-slate-850 p-4 flex flex-col justify-between flex-shrink-0">
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider px-2 block mb-1">
                  Active Modules
                </span>
                <nav className="space-y-1">
                  {currentTabs.map((t) => {
                    const TabIcon = t.icon;
                    const isActive = previewTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setPreviewTab(t.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-semibold transition ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        {t.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-850 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-650 flex items-center justify-center font-bold text-white text-[10px]">
                U
              </div>
              <div className="leading-none">
                <div className="text-[10px] font-bold text-white">Demo User</div>
                <span className="text-[8px] text-slate-500 uppercase font-semibold">{previewRole}</span>
              </div>
            </div>
          </div>

          {/* Mock Content Workspace */}
          <div className="flex-1 p-6 bg-slate-950 text-slate-350 space-y-6 overflow-y-auto max-h-[500px]">
            
            {/* Validator Warning Banner */}
            {previewRole === 'Validator' && (
              <div className="flex items-center gap-2.5 bg-amber-550/10 border border-amber-550/25 rounded-xl px-4 py-3 text-amber-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <div className="leading-normal">
                  <span className="font-bold text-amber-250">Validator Read-Only Workspace</span>
                  <p className="text-[10px] text-amber-400/80 mt-0.5">Write operations are disabled. Access control enforces complete compliance.</p>
                </div>
              </div>
            )}

            {/* Content Switcher */}
            {previewTab === 'overview' && previewRole === 'Owner' && (
              <div className="space-y-5 animate-fade-in">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-4 text-white">
                  <h3 className="font-bold text-sm">System Overview Dashboard</h3>
                  <p className="text-[10px] text-blue-100 mt-0.5">Real-time spend and microservices state. Only accessible to system owners.</p>
                </div>
                
                {/* Mini KPI Matrix */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <div className="text-lg font-bold text-white">94%</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Automation Rate</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <div className="text-lg font-bold text-white">12</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Active Vendors</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <div className="text-lg font-bold text-white">38</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Orders Drafted</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <div className="text-lg font-bold text-emerald-450">100%</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Alerts Resolved</div>
                  </div>
                </div>

                {/* Role Access Matrix */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-405 uppercase tracking-wider">Access Policy Log</h4>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex justify-between py-1 border-b border-slate-850">
                      <span className="text-slate-400">Owner Access Policy</span>
                      <span className="text-emerald-400 font-semibold">ALL_FEATURES</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-850">
                      <span className="text-slate-400">Manager Access Policy</span>
                      <span className="text-blue-400 font-semibold">OPERATIONS_CRUD</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Validator Access Policy</span>
                      <span className="text-amber-405 font-semibold">AUDIT_READ_ONLY</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {previewTab === 'inventory' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-sm">Inventory Ledger</h3>
                    <p className="text-[10px] text-slate-500">Real-time stock balance & safety benchmarks.</p>
                  </div>
                  {previewRole !== 'Validator' && (
                    <button className="bg-blue-600 hover:bg-blue-705 text-white px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer">
                      Add New SKU
                    </button>
                  )}
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-850 overflow-hidden">
                  <div className="grid grid-cols-4 bg-slate-850 p-2 text-[9px] font-bold text-slate-400 uppercase border-b border-slate-800">
                    <div>SKU Item</div>
                    <div>Stock</div>
                    <div>Threshold</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y divide-slate-850/60 text-[10.5px]">
                    <div className="grid grid-cols-4 p-2.5 items-center">
                      <div className="font-bold text-white">Dell Laptops</div>
                      <div>42 units</div>
                      <div className="text-slate-550">20 units</div>
                      <div className="text-right">
                        <button disabled={previewRole === 'Validator'} className={`px-2 py-0.5 rounded text-[9px] font-bold transition ${
                          previewRole === 'Validator'
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-blue-900/50 text-blue-450 border border-blue-800/40 hover:bg-blue-900'
                        }`}>
                          Consume
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 p-2.5 items-center">
                      <div className="font-bold text-white">Office Chairs</div>
                      <div className="text-rose-400">8 units ⚠️</div>
                      <div className="text-slate-550">15 units</div>
                      <div className="text-right">
                        <button disabled={previewRole === 'Validator'} className={`px-2 py-0.5 rounded text-[9px] font-bold transition ${
                          previewRole === 'Validator'
                            ? 'bg-slate-800 text-slate-655 cursor-not-allowed'
                            : 'bg-blue-900/50 text-blue-450 border border-blue-800/40 hover:bg-blue-900'
                        }`}>
                          Consume
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {previewTab === 'vendors' && (previewRole === 'Owner' || previewRole === 'Manager') && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-sm">Vendor Directory</h3>
                    <p className="text-[10px] text-slate-500">Add & monitor contract vendor rates.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl relative overflow-hidden">
                    <div className="text-xs font-bold text-white">Dell Logistics Inc.</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">sales@dell.com</div>
                    <div className="border-t border-slate-850 mt-3 pt-2 flex justify-between text-[10px]">
                      <span className="text-slate-550">Catalog Avg</span>
                      <span className="font-bold text-blue-400">$780.00</span>
                    </div>
                  </div>
                  
                  {/* Mock Add Vendor Form */}
                  <div className="bg-slate-900/50 border border-slate-850 border-dashed p-4 rounded-xl flex flex-col justify-center items-center text-center">
                    <Users className="w-5 h-5 text-slate-550 mb-1" />
                    <span className="text-[10px] font-bold text-slate-400">Add Vendor Interface Active</span>
                    <p className="text-[9px] text-slate-600 max-w-xs mt-0.5">Form fields enabled for {previewRole} input.</p>
                  </div>
                </div>
              </div>
            )}

            {previewTab === 'orders' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-sm">Purchase Orders Log</h3>
                    <p className="text-[10px] text-slate-505">Autonomous negotiation pipeline monitor.</p>
                  </div>
                  {previewRole !== 'Validator' && (
                    <button className="bg-blue-600 text-white px-2.5 py-1 rounded text-[10px] font-semibold">
                      Import Quote Doc
                    </button>
                  )}
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-850 overflow-hidden">
                  <div className="grid grid-cols-4 bg-slate-850 p-2 text-[9px] font-bold text-slate-400 uppercase border-b border-slate-800">
                    <div>SKU</div>
                    <div>Vendor</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y divide-slate-850/60 text-[10.5px]">
                    <div className="grid grid-cols-4 p-2.5 items-center">
                      <div className="font-bold text-white">Dell Latitude</div>
                      <div>Dell Inc.</div>
                      <div>
                        <span className="px-1.5 py-0.5 rounded bg-blue-955 text-blue-400 border border-blue-800/30 text-[9px] font-bold">
                          Negotiating
                        </span>
                      </div>
                      <div className="text-right">
                        {previewRole !== 'Validator' ? (
                          <button className="bg-emerald-900/40 text-emerald-450 border border-emerald-800/40 px-2 py-0.5 rounded text-[9px] font-bold">
                            Approve
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[9px] font-bold italic">Audited</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Draft preview box */}
                <div className="bg-slate-900/70 border border-slate-850 rounded-xl p-4 space-y-2">
                  <h4 className="text-[9px] font-bold text-slate-405 uppercase tracking-widest">RAG Email Draft Preview</h4>
                  <p className="text-[10px] font-mono text-slate-505 bg-slate-950 p-2 rounded leading-relaxed border border-slate-900">
                    "Requesting Dell Latitude units at a rate of $780/unit based on historical averages..."
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    );
  };

  // ── Auto Carousel Interval ───────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 2);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // ── Pipeline auto-advance timer ──────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);



  // ── ROI Calculations ──────────────────────────────────────────────────────
  const calculatedSavings = Math.round((monthlySpend * 0.12) + (manualHours * 45 * 0.85));
  const calculatedHoursSaved = Math.round(manualHours * 0.85);

  // ── Mock Data ─────────────────────────────────────────────────────────────
  const pipelineSteps = [
    { title: 'Stock Alert',    desc: 'Telemetry registers consumption event below safety threshold.' },
    { title: 'AI Generation',  desc: 'FastAPI microservice drafts context-aware negotiation payload.' },
    { title: 'B2B Dispatch',   desc: 'Structured negotiation email dispatched to vendor contact.' },
    { title: 'Quote Parsing',  desc: 'Base64 PDF invoice parsed via regex into structured fields.' },
    { title: 'PO Finalized',   desc: 'Purchase Order created, inventory restocked to baseline.' },
  ];



  const pricingTiers = [
    {
      name: 'Startup',
      price: billingCycle === 'monthly' ? '$49' : '$39',
      period: '/month',
      desc: 'For small size business beginning their automated path.',
      features: [
        'Up to 50 active inventory SKUs',
        'Automated telemetry low-stock alerts',
        'Template-based negotiation drafts',
        'Core spend analytics dashboards',
        '2 user seats included',
      ],
      cta: 'Configure Startup'
    },
    {
      name: 'Growth',
      price: billingCycle === 'monthly' ? '$149' : '$119',
      period: '/month',
      desc: 'Full multi-agent capabilities for scaling operations.',
      features: [
        'Unlimited active inventory SKUs',
        'FastAPI restock negotiation drafts',
        'Base64 PDF invoice parsing OCR',
        'Historical vendor average audits',
        '10 user seats with full RBAC policies',
      ],
      popular: true,
      cta: 'Configure Growth'
    },
    {
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? '$499' : '$399',
      period: '/month',
      desc: 'Dedicated infrastructure for large B2B supply chains.',
      features: [
        'Isolated multi-company tenancy servers',
        'Fine-tuned NLP parameter templates',
        'High-priority API limits SLA guarantee',
        'Dedicated Render/Vercel cluster deployment',
        'SSO integration and 24/7 dedicated support',
      ],
      cta: 'Configure Enterprise'
    },
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Director of Procurement',
      company: 'Tata Logistics',
      text: 'ProcureAI eliminated our restocking blind spots entirely. Stock outages are down 80% and the automated negotiation drafts are indistinguishable from what our senior buyers used to write manually.',
      stars: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Supply Chain',
      company: 'Reliance Retail B2B',
      text: 'The invoice document parser alone justified the entire platform cost. Upload a vendor PDF, and a complete purchase order is ready in seconds. The accuracy is remarkable.',
      stars: 5,
    },
  ];

  const faqs = [
    {
      q: 'How does the multi-agent RAG negotiation loop work?',
      a: 'When inventory drops below a safety threshold, the Node.js backend dispatches item metadata to a FastAPI Python microservice. The microservice retrieves historical vendor price averages from context memory and generates a structured, price-optimized negotiation draft — automatically attached to a new Draft Purchase Order in MongoDB.',
    },
    {
      q: 'What document formats does the invoice parser support?',
      a: 'The parser accepts both PDF invoice files and plain-text quote documents. Files are base64-encoded client-side, transmitted to the FastAPI /parse-pdf endpoint, and decoded using pypdf + regex extraction schemas to isolate vendor name, item description, quantity, and quoted price fields.',
    },
    {
      q: 'How does the RBAC access control system work?',
      a: 'All routes are protected by JWT Bearer token validation. Each token contains the user role (Owner, Manager, or Validator) and companyId for multi-tenant isolation. The authorize() middleware enforces route-level access restrictions — for example, only Owner and Manager roles can trigger inventory consumption or create Purchase Orders.',
    },
    {
      q: 'What happens if the AI service is unavailable?',
      a: 'ProcureAI includes a fail-safe error boundary: if the FastAPI microservice returns an error or times out, the system creates a Purchase Order with status set to Manual_Review_Required in MongoDB, logs the failure with the item and stock state, and continues without breaking the Node.js pipeline. No data is lost.',
    },
  ];

  const blogPosts = [
    {
      title: 'Automating Telemetry Triggers in B2B SaaS',
      desc: 'Learn how to construct custom warning triggers in Node.js to monitor inventory safety boundaries in real time.',
      author: 'Amit Patel',
      date: '04 Jun, 2026',
      img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'FastAPI Negotiation Algorithms Benchmarks',
      desc: 'An in-depth review of RAG prompt tuning and database quote extraction scripts to secure pricing contract discounts.',
      author: 'Neha Gupta',
      date: '02 Jun, 2026',
      img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Decoupled Microservice Safety Boundaries',
      desc: 'Implementing fallbacks in Express routers to maintain continuous operations during external FastAPI NLP failures.',
      author: 'Priya Sharma',
      date: '28 May, 2026',
      img: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col relative select-none">
      
      {/* Decorative AI/Automation Tech Grid Mesh Backdrop */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none z-0 bg-repeat bg-center" 
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80')`,
          backgroundSize: '1200px'
        }} 
      />
      
      {/* ── Topbar Banner ────────────────────────────────────────────────────── */}
      <div className="w-full bg-slate-900 text-slate-300 text-xs py-2.5 px-6 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              123 Broadway, New York, USA
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-blue-500" />
              +1 (212) 555-0199
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              support@procureai.com
            </span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition">Twitter</span>
            <span className="hover:text-white cursor-pointer transition">LinkedIn</span>
            <span className="hover:text-white cursor-pointer transition">GitHub</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          NAVIGATION
      ══════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo light={false} showSubtitle={true} />

          <nav className="hidden md:flex items-center gap-8">
            {[['#about', 'About'], ['#features', 'Why Choose Us'], ['#services', 'Services'], ['#sandbox', 'Simulation'], ['#roi', 'ROI Calculator'], ['#pricing', 'Pricing'], ['#blog', 'Blog']].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-xs font-bold text-slate-650 hover:text-blue-600 transition-colors tracking-wide"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center">
            <button
              id="nav-cta-btn"
              onClick={onGetStarted}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition shadow"
            >
              Access Platform
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO CAROUSEL SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[500px] sm:h-[600px] overflow-hidden bg-slate-950">
        
        {/* Cyberpunk matrix technology background pattern for AI context */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-screen pointer-events-none z-0">
          <img
            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"
            alt="AI telemetry matrix background"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Slide 1 */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
          activeSlide === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}>
          <div className="absolute inset-0 bg-slate-900/60 z-10" />
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
            alt="B2B SaaS telemetry dashboard automation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-6">
            <div className="max-w-3xl space-y-6">
              <h5 className="text-blue-400 text-xs sm:text-sm font-bold uppercase tracking-widest animate-fade-in-down">
                Creative & Innovative SaaS
              </h5>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Creative & Innovative Digital Restock Solutions
              </h1>
              <p className="text-zinc-300 text-sm max-w-lg mx-auto leading-relaxed">
                Empower your business with multi-agent RAG negotiations and Express inventory telemetry.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button onClick={onGetStarted} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl tracking-wider uppercase transition">
                  Free Quote
                </button>
                <a href="#quote" className="px-6 py-3 border border-white hover:bg-white hover:text-slate-900 text-white text-xs font-bold rounded-xl tracking-wider uppercase transition">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2 */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
          activeSlide === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}>
          <div className="absolute inset-0 bg-slate-900/60 z-10" />
          <img
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80"
            alt="AI NLP network graphs and machine learning microservice"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-6">
            <div className="max-w-3xl space-y-6">
              <h5 className="text-blue-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
                Data-Driven B2B Operations
              </h5>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Self-Negotiating Procurement Automation
              </h1>
              <p className="text-zinc-300 text-sm max-w-lg mx-auto leading-relaxed">
                Monitor safety bounds, trigger FastAPI negotiation loops, and parse PDF quotes automatically.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button onClick={onGetStarted} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl tracking-wider uppercase transition">
                  Free Quote
                </button>
                <a href="#quote" className="px-6 py-3 border border-white hover:bg-white hover:text-slate-900 text-white text-xs font-bold rounded-xl tracking-wider uppercase transition">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel controls */}
        <button
          onClick={() => setActiveSlide((prev) => (prev === 0 ? 1 : 0))}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white border border-white/20"
        >
          ‹
        </button>
        <button
          onClick={() => setActiveSlide((prev) => (prev === 0 ? 1 : 0))}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white border border-white/20"
        >
          ›
        </button>

      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FACTS SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-0 border border-slate-100 rounded-xl overflow-hidden shadow-lg bg-white">
          
          <div className="bg-blue-600 p-8 flex items-center gap-5 text-left">
            <div className="w-12 h-12 bg-white text-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Active Companies</div>
              <div className="text-3xl font-extrabold text-white mt-0.5">1,200+</div>
            </div>
          </div>

          <div className="bg-white p-8 flex items-center gap-5 text-left border-y md:border-y-0 md:border-x border-slate-150">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">POs Processed Automatically</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-0.5">15,420+</div>
            </div>
          </div>

          <div className="bg-blue-600 p-8 flex items-center gap-5 text-left">
            <div className="w-12 h-12 bg-white text-blue-600 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Spend Margins Saved</div>
              <div className="text-3xl font-extrabold text-white mt-0.5">$12.4M</div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ABOUT US SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Column Text */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">About Us</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              The Best B2B Procurement Solution with Dynamic AI Loops
            </h2>
          </div>
          
          <p className="text-slate-500 text-xs leading-relaxed">
            ProcureAI closes the budget leakages in traditional vendor management. Our platform tracks stock telemetry warning limits in real time and automatically activates negotiation loops to secure pre-budget quote rates.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
            <div className="space-y-3.5">
              <span className="flex items-center gap-3 text-xs font-bold text-slate-800">
                <Check className="w-4 h-4 text-blue-600" />
                Award-Winning AI Agents
              </span>
              <span className="flex items-center gap-3 text-xs font-bold text-slate-800">
                <Check className="w-4 h-4 text-blue-600" />
                24/7 Outage Fail-Safe Circuit
              </span>
            </div>
            <div className="space-y-3.5">
              <span className="flex items-center gap-3 text-xs font-bold text-slate-800">
                <Check className="w-4 h-4 text-blue-600" />
                Professional Staff Support
              </span>
              <span className="flex items-center gap-3 text-xs font-bold text-slate-800">
                <Check className="w-4 h-4 text-blue-600" />
                Competitive Billing Packages
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6">
            <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 rounded-xl p-3 px-5">
              <Phone className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ask a Specialist</div>
                <div className="text-xs font-bold text-slate-800">+1 (212) 555-0199</div>
              </div>
            </div>
            <a href="#quote" className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition">
              Request A Quote
            </a>
          </div>
        </div>

        {/* Right Column Image */}
        <div className="lg:col-span-5 relative h-[380px] lg:h-[480px]">
          <img
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80"
            alt="Business executive outlining automated logistics strategy"
            className="w-full h-full object-cover rounded-xl shadow-lg border border-slate-100"
          />
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          WHY CHOOSE US (FEATURES)
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          <div className="max-w-xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">We Grow Your Business Margins Exponentially</h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column Features */}
            <div className="lg:col-span-4 space-y-12 text-left">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Best In B2B Industry</h4>
                <p className="text-[11.5px] text-slate-500 leading-relaxed">
                  First-of-its-kind MERN telemetry connected dynamically to python-fastapi neural processors.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Award Winning Pipeline</h4>
                <p className="text-[11.5px] text-slate-500 leading-relaxed">
                  Autonomous email negotiations that consistently secure pre-negotiated quote bounds.
                </p>
              </div>
            </div>

            {/* Center Image */}
            <div className="lg:col-span-4 h-[350px] relative">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                alt="Automated telemetry sensors and machine learning systems"
                className="w-full h-full object-cover rounded-xl border border-slate-100 shadow"
              />
            </div>

            {/* Right Column Features */}
            <div className="lg:col-span-4 space-y-12 text-left">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Settings className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Professional Security</h4>
                <p className="text-[11.5px] text-slate-500 leading-relaxed">
                  Decoupled authorization controllers validation and encrypted JWT cookies company isolation.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">24/7 Outage Protection</h4>
                <p className="text-[11.5px] text-slate-500 leading-relaxed">
                  Outage fail-safe triggers automatically write PO requests to fallback audit collections in MongoDB.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          OUR SERVICES
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="services" className="py-24 max-w-7xl mx-auto px-6 space-y-16">
        
        <div className="max-w-xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Our Services</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Custom B2B Solutions for Your Business</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {[
            { title: 'Telemetry Limits Audits', icon: Shield, desc: 'Real-time database triggers execute on stock consumption events, immediately catching safety bounds breaches.' },
            { title: 'AI Negotiation Agents', icon: BarChart3, desc: 'FastAPI microservices match incoming item logs against catalog historical averages to auto-generate contract drafts.' },
            { title: 'PDF Invoice Parser', icon: FileText, desc: 'OCR document readers decode Base64 file payloads and map unit quantities, prices, and vendors into collections.' },
            { title: 'Tenant Access Security', icon: Lock, desc: 'Hardened REST routes check JWT role tags (Owner, Manager, Validator) and isolate company workspace telemetry.' },
            { title: 'Outage Fail-Safe Pipeline', icon: AlertCircle, desc: 'Conditional error handlers automatically route purchase orders to manual review states if external APIs time out.' },
          ].map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-slate-50/50 hover:bg-white border border-slate-200 hover:border-blue-500/30 rounded-2xl p-8 space-y-4 hover:shadow-lg transition text-left group"
              >
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-800">{service.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{service.desc}</p>
              </div>
            );
          })}

          {/* Call for Custom Solutions card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-650 rounded-2xl p-8 flex flex-col justify-center text-center text-white space-y-4 shadow">
            <h4 className="text-lg font-bold">Call Us For Custom SLA</h4>
            <p className="text-xs text-blue-100 leading-relaxed">
              We offer dedicated deployments, dedicated FastAPI servers, and SSO models for large scale operations.
            </p>
            <h2 className="text-xl font-extrabold">+1 (212) 555-0199</h2>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SIMULATION SANDBOX
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="sandbox" className="py-24 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Interactive Sandbox</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Sandbox Simulators</h2>
            <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
              Simulate the restocking operations loop or examine the dynamic interface generated for different platform roles.
            </p>

            {/* Sandbox Mode Selector */}
            <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl mt-4 shadow-sm">
              <button
                onClick={() => setSandboxMode('pipeline')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  sandboxMode === 'pipeline' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Restock Flow Pipeline
              </button>
              <button
                onClick={() => setSandboxMode('rbac')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  sandboxMode === 'rbac' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Role-Based UI Explorer
              </button>
            </div>
          </div>

          {sandboxMode === 'pipeline' ? (
            <div className="grid lg:grid-cols-12 gap-8 items-start animate-fade-in">
              
              {/* Steps select */}
              <div className="lg:col-span-4 space-y-2 text-left">
                {pipelineSteps.map((step, idx) => {
                  const isActive = activeStep === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => { setActiveStep(idx); setIsPlaying(false); }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                        isActive
                          ? 'bg-white border-blue-500/50 shadow-sm text-slate-900'
                          : 'bg-transparent border-transparent text-slate-500 hover:bg-white/40'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold tracking-wide">{step.title}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </button>
                  );
                })}
                
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 px-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold transition"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlaying ? 'Pause' : 'Resume'} Playback
                  </button>
                  <span>Cycle interval: 4.5s</span>
                </div>
              </div>

              {/* Terminal */}
              <div className="lg:col-span-8">
                <div className="bg-[#0B0F19] text-zinc-300 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg text-left">
                  <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest font-mono">restock_telemetry_agent.log</span>
                    <span className="text-[10px] text-blue-400 font-mono font-bold">State {activeStep + 1} of 5</span>
                  </div>

                  <div className="p-6 min-h-[220px] flex flex-col justify-between">
                    
                    {activeStep === 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-450 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Low Stock Alert Triggered
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">SKU-40291</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-white">
                            <span>Dell Latitude Laptops</span>
                            <span className="text-rose-400 font-mono">8 / 20 units safety threshold</span>
                          </div>
                          <div className="w-full bg-zinc-850 h-2 rounded-full overflow-hidden border border-zinc-800">
                            <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full w-[40%]" />
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                            The Node.js backend telemetry listener intercepts inventory consumption, identifying a safety baseline breach. The REST controller immediately prepares a restock webhook.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeStep === 1 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                            <Cpu className="w-3 h-3 animate-spin" />
                            FastAPI Agent Processing
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">ai-service:8000</span>
                        </div>
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 font-mono text-[10px] text-zinc-400 space-y-1.5">
                          <div className="text-zinc-650">{"// Fetching vendor parameters and price averages"}</div>
                          <div className="text-violet-400">→ Dell Inc catalog average price identified: $800.00</div>
                          <div className="text-violet-400">→ Calculating target negotiation discount: $780.00 (-2.5%)</div>
                          <div className="text-emerald-400">✓ AI negotiation contract draft compiled. Returning callback to backend.</div>
                        </div>
                      </div>
                    )}

                    {activeStep === 2 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Restock Negotiation Dispatched
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">PO: "Draft"</span>
                        </div>
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-xs space-y-2">
                          <div className="flex items-center gap-2"><span className="text-zinc-500 font-semibold w-8">To:</span> <span className="text-white">representative@dell.com</span></div>
                          <div className="flex items-center gap-2"><span className="text-zinc-550 font-semibold w-8">Re:</span> <span className="text-white font-medium">B2B Restocking Order - Dell Latitude (40 units)</span></div>
                          <div className="border-t border-zinc-900 pt-2 text-zinc-400 leading-relaxed text-[11.5px] font-mono">
                            "Based on our purchase volumes and historical quotes ($800), we request 40 Dell Latitude units at a rate of $780/unit. Let us know if this quote works."
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 3 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                            <FileSearch className="w-3 h-3" />
                            PDF Parser Active
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">Base64 Stream</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-xs">
                            <div className="text-[8px] font-bold text-zinc-505 uppercase tracking-widest">Base64 Quote File</div>
                            <div className="text-white font-bold truncate mt-1">invoice_dell_latitude.pdf</div>
                            <div className="text-emerald-400 text-[10px] mt-1">OCR Match Verified ✓</div>
                          </div>
                          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 grid grid-cols-2 gap-1 text-center font-mono">
                            <div>
                              <div className="text-[8px] text-zinc-550 uppercase">Vendor</div>
                              <div className="text-[11px] font-bold text-white mt-1">Dell Inc</div>
                            </div>
                            <div>
                              <div className="text-[8px] text-zinc-550 uppercase">Quoted</div>
                              <div className="text-[11px] font-bold text-emerald-400 mt-1">$780.00</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 4 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Replenishment Confirmed
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">Sync Successful</span>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                            <Check className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Inventory updated successfully</div>
                            <div className="text-[10.5px] text-zinc-400 mt-1">Purchase Order PO-10291 set to "Confirmed" status. Dell Laptop stock level reset to 48.</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-zinc-555 border-t border-zinc-900 pt-3 mt-3">
                      {pipelineSteps[activeStep].desc}
                    </div>

                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Role Select Toolbar */}
              <div className="flex flex-wrap items-center gap-3 bg-white p-3 border border-slate-200 rounded-2xl shadow-sm justify-center sm:justify-start">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
                  Select Role Environment:
                </span>
                <button
                  onClick={() => handlePreviewRoleChange('Owner')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    previewRole === 'Owner'
                      ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-purple-600" />
                  Owner (Full View)
                </button>
                <button
                  onClick={() => handlePreviewRoleChange('Manager')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    previewRole === 'Manager'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Manager (Operational)
                </button>
                <button
                  onClick={() => handlePreviewRoleChange('Validator')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    previewRole === 'Validator'
                      ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  Validator (Read-Only)
                </button>
              </div>

              {/* Render dynamic interactive workspace mockup */}
              {renderRbacPreview()}
            </div>
          )}

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ROI CALCULATOR
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="roi" className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-5 text-left">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">ROI Metrics</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Procurement Savings Calculator</h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              Verify how much spend leakage and manual labor your company can prevent by running automated workflows.
            </p>
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-emerald-650 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500"><strong className="text-slate-800">12% Average Discount</strong> negotiated through automated historical vendor price matching.</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-emerald-650 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500"><strong className="text-slate-800">85% Process Workload Cut</strong> by removing manual email drafts and quote verification loops.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-slate-50 border border-slate-200 shadow-lg rounded-2xl p-8 space-y-6 text-left">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Configure Savings Parameters</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-505">
                  <span>Monthly Purchase Spend</span>
                  <span className="text-slate-950 font-bold font-mono">${monthlySpend.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={monthlySpend}
                  onChange={(e) => setMonthlySpend(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>$5,000</span>
                  <span>$50,000</span>
                  <span>$100,000</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-505">
                  <span>Manual Workload Hours</span>
                  <span className="text-slate-950 font-bold font-mono">{manualHours} hrs/month</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="160"
                  step="5"
                  value={manualHours}
                  onChange={(e) => setManualHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>10 hours</span>
                  <span>80 hours</span>
                  <span>160 hours</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-slate-150">
                <div>
                  <div className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Estimated Monthly Savings</div>
                  <div className="text-2xl font-extrabold text-blue-605 font-mono mt-1">
                    ${calculatedSavings.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Est. ${(calculatedSavings * 12).toLocaleString()} saved/year</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Work Hours Saved</div>
                  <div className="text-2xl font-extrabold text-indigo-605 font-mono mt-1">
                    {calculatedHoursSaved} hrs
                  </div>
                  <div className="text-[9px] text-slate-405 mt-0.5">Reclaimed for core ops</div>
                </div>
              </div>

              <button
                onClick={onGetStarted}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition shadow-sm"
              >
                Claim Savings Target
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PRICING PLAN
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Pricing Plans</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">We are Offering Competitive Prices</h2>
            
            <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl mt-3 shadow-sm">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  billingCycle === 'yearly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Yearly Billing
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-extrabold rounded uppercase tracking-wider">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm items-start">
            {pricingTiers.map((tier, idx) => (
              <div
                key={tier.name}
                className={`p-8 space-y-6 flex flex-col min-h-[460px] text-left border-b lg:border-b-0 ${
                  idx === 1
                    ? 'bg-slate-50/30 border-y lg:border-y-0 lg:border-x border-slate-200 shadow-sm relative z-10'
                    : 'border-slate-100'
                }`}
              >
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">{tier.name} Plan</h3>
                  <p className="text-xs text-slate-400 font-medium leading-normal">{tier.desc}</p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-slate-900 font-mono">{tier.price}</span>
                  <span className="text-xs text-slate-500 font-semibold">{tier.period}</span>
                </div>
                <ul className="space-y-3.5 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-650 leading-relaxed">
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-sm"
                >
                  Order Now
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          REQUEST A QUOTE
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="quote" className="py-24 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Info Text */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Request A Quote</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Need A Free Quote? Please Feel Free to Contact Us
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Check className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-750">Reply within 24 hours</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Check className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-750">24 hrs telephone support</span>
            </div>
          </div>

          <p className="text-slate-500 text-xs leading-relaxed">
            Need customized NLP negotiation models or dedicated server clusters for multi-tenant isolation? Submit your company requirements below to speak with our procurement architecture specialists.
          </p>

          <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 rounded-xl p-3.5 px-6 w-fit">
            <Phone className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Call to ask any question</div>
              <div className="text-xs font-bold text-slate-800">+1 (212) 555-0199</div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-5">
          <div className="bg-blue-600 rounded-2xl p-8 shadow-lg text-left">
            <form onSubmit={(e) => { e.preventDefault(); onGetStarted(); }} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border-0 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-xs text-slate-800"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 border-0 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-xs text-slate-800"
                  required
                />
              </div>
              <div>
                <select className="w-full px-4 py-3 border-0 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-xs text-slate-500">
                  <option>Select A Service</option>
                  <option value="1">Telemetry Inventory Audits</option>
                  <option value="2">AI Negotiations Engine</option>
                  <option value="3">OCR Quote Parsing</option>
                </select>
              </div>
              <div>
                <textarea
                  placeholder="Message"
                  rows="3"
                  className="w-full px-4 py-3 border-0 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-xs text-slate-800"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition"
              >
                Request A Quote
              </button>
            </form>
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Testimonial</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">What Our Clients Say About Our Services</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 text-left hover:border-slate-350 transition shadow-sm">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-450 text-amber-450" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">"{t.text}"</p>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <div className="text-[10px] text-slate-550 mt-0.5">{t.role}</div>
                  </div>
                  <span className="text-[10px] text-blue-650 font-bold uppercase tracking-wider bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">{t.company}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TEAM MEMBERS SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-6 space-y-16">
        
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Team Members</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Professional Staff Ready to Help Your Business</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {[
            { name: 'Vikram Malhotra', role: 'CTO / Procurement Architect', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=350&q=80' },
            { name: 'Aditi Rao', role: 'CEO / Operations Lead', img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=350&q=80' },
            { name: 'Priya Sharma', role: 'Head of Customer Success', img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=350&q=80' },
          ].map((member, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm group">
              <div className="h-72 overflow-hidden bg-slate-200">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-5 text-center">
                <h4 className="text-base font-bold text-slate-900">{member.name}</h4>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1">{member.role}</p>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          LATEST BLOG SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="blog" className="py-24 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Latest Blog</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Read The Latest Articles from Our Blog</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, idx) => (
              <div key={idx} className="bg-white border border-slate-250 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div className="h-48 overflow-hidden bg-slate-100">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-left space-y-4">
                  <div className="flex text-[10px] text-slate-400 gap-4 font-semibold uppercase tracking-wider">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{post.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{post.desc}</p>
                  <button onClick={onGetStarted} className="text-xs font-bold text-blue-650 hover:text-blue-750 flex items-center gap-1 transition">
                    Read More <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FAQS ACCORDION
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="faqs" className="py-24 border-t border-slate-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">FAQs</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4 text-left">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="bg-slate-50/50 border border-slate-200 hover:border-slate-350 rounded-2xl overflow-hidden transition shadow-sm">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full px-6 py-4.5 flex items-center justify-between text-left focus:outline-none animate-fade-in"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-950 px-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-12 text-left">
          
          <div className="space-y-4">
            <div className="text-white mb-2">
              <Logo light={true} showSubtitle={true} />
            </div>
            <p className="text-xs leading-relaxed">
              Leading the path in autonomous B2B procurement, integrating REST telemetry with FastAPI neural processors.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <a href="#about" className="hover:text-white transition">About Us</a>
              <a href="#features" className="hover:text-white transition">Why Choose Us</a>
              <a href="#services" className="hover:text-white transition">Our Services</a>
              <a href="#pricing" className="hover:text-white transition">Pricing Plans</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Solutions</h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <span className="hover:text-white cursor-pointer transition">Telemetry Triggers</span>
              <span className="hover:text-white cursor-pointer transition">AI Negotiation Engine</span>
              <span className="hover:text-white cursor-pointer transition">OCR Invoices Parser</span>
              <span className="hover:text-white cursor-pointer transition">Fail-Safe fallbacks</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact Desk</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" /><span>123 Broadway, NY, USA</span></div>
              <div className="flex items-start gap-2.5"><Phone className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" /><span>+1 (212) 555-0199</span></div>
              <div className="flex items-start gap-2.5"><Mail className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" /><span>support@procureai.com</span></div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} ProcureAI Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;