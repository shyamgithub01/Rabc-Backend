import React, { useState } from "react";
import { 
  FaHome, FaUsers, FaCogs, FaTools, 
  FaChartBar, FaBriefcase, FaRegLifeRing, 
  FaUserCog 
} from "react-icons/fa";
import { motion } from "framer-motion";
import SuperAdminDashboard from "./SuperAdminDashboard";

// Color constants
const MIDNIGHT_BLUE = "#41729f";
const BLUE_GRAY = "#5885af";
const DARK_BLUE = "#274472";
const BABY_BLUE = "#c3e0e5";

function SuperAdminWelcome() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    return <SuperAdminDashboard />;
  };

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { key: "manage-admins", label: "Manage Admins", icon: <FaUserCog /> },
    { key: "manage-users", label: "Manage Users", icon: <FaUsers /> },
    { key: "device-logs", label: "Device Logs", icon: <FaTools /> },
    { key: "analytics", label: "Analytics", icon: <FaChartBar /> },
    { key: "settings", label: "Settings", icon: <FaCogs /> },
    { key: "support", label: "Support", icon: <FaRegLifeRing /> },
  ];

  return (
    <div 
      className="w-full flex h-[92.95vh]"
     
    >
      {/* Premium Blue Sidebar */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-64 flex flex-col shadow-xl"
        style={{ background: `linear-gradient(180deg, ${DARK_BLUE} 0%, ${MIDNIGHT_BLUE} 100%)` }}
      >
        <div className="px-6 py-5 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div 
              className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${BABY_BLUE}30` }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide text-white">IoT Control Hub</h1>
              <p className="text-xs text-white/80">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-6">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <motion.li 
                key={item.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    activeTab === item.key
                      ? "bg-white text-[#274472] font-semibold shadow-md"
                      : "text-white/90 hover:bg-[#5885af]"
                  }`}
                >
                  <span className="mr-3 text-base">{item.icon}</span>
                  {item.label}
                  {activeTab === item.key && (
                    <motion.div 
                      layoutId="activeTab"
                      className="ml-auto w-1.5 h-1.5 bg-[#274472] rounded-full"
                    />
                  )}
                </button>
              </motion.li>
            ))}
          </ul>
        </nav>

        <div 
          className="px-4 py-4 text-xs text-white/50 border-t border-white/20"
          style={{ backgroundColor: DARK_BLUE }}
        >
          <p>&copy; {new Date().getFullYear()} IoT Solutions</p>
          <p className="mt-1">v2.5.0 | Professional</p>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div 
        className="flex-1 overflow-auto "
        style={{ maxWidth: 'auto', margin: '0 auto' }}
      >
        
          {renderContent()}
        
      </div>
    </div>
  );
}

export default SuperAdminWelcome;