import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import api from "../api";

// Mock data for modules (would come from API in real app)
const mockModules = [
  { id: "finance", name: "Finance Dashboard", icon: "💰", permissions: ["view", "edit", "export"], color: "from-yellow-100 to-yellow-200", description: "Manage budgets, expenses, and financial reports" },
  { id: "hr", name: "Human Resources", icon: "👥", permissions: ["view", "create", "manage"], color: "from-blue-100 to-blue-200", description: "Employee management and HR operations" },
  { id: "analytics", name: "Data Analytics", icon: "📊", permissions: ["view", "analyze", "export"], color: "from-purple-100 to-purple-200", description: "Business intelligence and data visualization" },
  { id: "inventory", name: "Inventory Management", icon: "📦", permissions: ["view", "edit", "manage"], color: "from-green-100 to-green-200", description: "Track and manage product inventory" },
  { id: "settings", name: "System Settings", icon: "⚙️", permissions: ["admin", "configure"], color: "from-gray-100 to-gray-200", description: "Configure application settings and permissions" }
];

// Badge component
const PermissionBadge = ({ permission }) => {
  const colorMap = {
    view: "bg-blue-100 text-blue-800 border-blue-200",
    edit: "bg-yellow-100 text-yellow-800 border-yellow-200",
    create: "bg-green-100 text-green-800 border-green-200",
    delete: "bg-red-100 text-red-800 border-red-200",
    manage: "bg-purple-100 text-purple-800 border-purple-200",
    admin: "bg-indigo-100 text-indigo-800 border-indigo-200",
    export: "bg-teal-100 text-teal-800 border-teal-200",
    analyze: "bg-pink-100 text-pink-800 border-pink-200",
    configure: "bg-gray-100 text-gray-800 border-gray-200"
  };
  const iconMap = {
    view: "👁️",
    edit: "✏️",
    create: "🆕",
    delete: "🗑️",
    manage: "⚙️",
    admin: "🔒",
    export: "📤",
    analyze: "🔍",
    configure: "🛠️"
  };
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
      className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full border ${colorMap[permission]}`}
    >
      {iconMap[permission]}
      <span className="ml-1.5 capitalize">{permission}</span>
    </motion.span>
  );
};

// Progress bar
const ProgressBar = ({ percentage }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 500);
    return () => clearTimeout(timer);
  }, [percentage]);
  return (
    <div className="mt-8 bg-gray-100 rounded-full h-4 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full relative"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold text-white"
        >
          {progress}%
        </motion.span>
      </motion.div>
    </div>
  );
};

// Donut chart
const DonutChart = ({ modules }) => {
  const controls = useAnimation();
  const { ref, inView } = useInView();
  useEffect(() => { if (inView) controls.start("visible"); }, [controls, inView]);
  const total = modules.reduce((sum, m) => sum + m.permissions.length, 0);
  const max = mockModules.reduce((sum, m) => sum + m.permissions.length, 0);
  const coverage = Math.round((total / max) * 100);
  const variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.8, type: "spring", bounce: 0.4 } }
  };
  return (
    <motion.div ref={ref} initial="hidden" animate={controls} variants={variants} className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <motion.circle
          cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"
          initial={{ strokeDasharray: "0 251" }}
          animate={{ strokeDasharray: `${251 * (coverage/100)} 251` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.2 }} className="text-2xl font-bold text-yellow-600">
          {coverage}%
        </motion.span>
        <motion.span initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4 }} className="text-xs text-gray-500 mt-1">
          Access Coverage
        </motion.span>
      </div>
    </motion.div>
  );
};

// Main dashboard
export default function UserDashboard() {
  const [user, setUser] = useState({ name: '', email: '', role: '' });
  const [modules, setModules] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  // decode JWT manually
  const decodeEmail = () => {
    try {
      const token = localStorage.getItem('access_token');
      const [, payload] = token.split('.');
      return JSON.parse(atob(payload)).sub;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const meEmail = decodeEmail();
        const res = await api.get('/users-with-permissions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        const me = res.data.find(u => u.email === meEmail) || {};
        setUser(me);
        const perms = me.modules && me.modules.length ? me.modules : mockModules;
        setModules(perms);
        setFiltered(perms);
      } catch {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFiltered(modules);
    } else {
      setFiltered(
        modules.filter(m =>
          m.permissions.includes(filter) || m.name.toLowerCase().includes(filter)
        )
      );
    }
  }, [filter, modules]);

  const toggleExpand = id => setExpanded(expanded === id ? null : id);
  const coveragePct = modules.length
    ? Math.round(
        modules.reduce((sum, m) => sum + m.permissions.length, 0) /
        mockModules.reduce((sum, m) => sum + m.permissions.length, 0) *
        100
      )
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 border-4 border-yellow-500 border-t-transparent rounded-full"
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
            className="w-8 h-8 bg-yellow-500 rounded-full m-auto mt-8"
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-lg text-gray-600"
        >
          Loading your access permissions...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded-md mt-12"
      >
        <div className="flex items-start">
          <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-600 via-blue-600 to-green-500 bg-clip-text text-transparent">
            Access Control Dashboard
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your permissions across application modules
          </p>
        </motion.header>

        {/* Summary Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl shadow-xl p-6 mb-12 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full p-1">
                  <div className="bg-white rounded-full p-1">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Modules</p>
                  <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Access Coverage</p>
                  <p className="text-2xl font-bold text-gray-900">{coveragePct}%</p>
                </div>
              </div>
            </div>
            <DonutChart modules={modules} />
          </div>
          <ProgressBar percentage={coveragePct} />
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-wrap justify-center gap-3 mb-10">
          {['all', 'admin', 'manage', 'view'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${filter===f? 'bg-gray-800 text-white shadow-md':'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Module Grid */}
        <motion.div initial="hidden" animate="show" variants={{ hidden:{ opacity:0 }, show:{ opacity:1, transition:{ staggerChildren:0.1} }}} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filtered.map(mod => (
              <motion.div
                key={mod.id}
                initial={{ opacity:0, scale:0.8 }}
                animate={{ opacity:1, scale:1 }}
                exit={{ opacity:0, scale:0.8 }}
                transition={{ duration:0.3, type:'spring' }}
                className="relative"
              >
                <motion.div
                  whileHover={{ y:-5, boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)' }}
                  whileTap={{ scale:0.98 }}
                  onClick={() => toggleExpand(mod.id)}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer border ${expanded===mod.id? 'ring-2 ring-yellow-500':'border-gray-100'}`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-2xl`}>{mod.icon}</div>
                        <h3 className="text-xl font-bold text-gray-900 mt-4">{mod.name}</h3>
                        <p className="text-gray-600 mt-2 text-sm">{mod.description}</p>
                      </div>
                      <motion.div animate={{ rotate: expanded===mod.id? 180:0 }} className="text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {expanded===mod.id && (
                        <motion.div
                          key={`details-${mod.id}`}
                          initial={{ height:0, opacity:0 }}
                          animate={{ height:'auto', opacity:1 }}
                          exit={{ height:0, opacity:0 }}
                          transition={{ duration:0.3 }}
                          className="mt-6 pt-6 border-t border-gray-100"
                        >
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Your Permissions:</h4>
                          <div className="flex flex-wrap gap-2">
                            {mod.permissions.map(p => <PermissionBadge key={p} permission={p}/>)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length===0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-16">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No modules found</h3>
            <p className="mt-1 text-gray-500">Try changing your filter criteria</p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
