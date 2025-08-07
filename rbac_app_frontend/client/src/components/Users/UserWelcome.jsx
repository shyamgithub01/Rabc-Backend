import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FaTachometerAlt, 
  FaLaptop, 
  FaFileAlt,
  FaBolt
} from "react-icons/fa";
import UserDashboard from "./UserDashboard";
import UserDevices from "./UserDevices";
import UserReport from "./UserReports";
import api from "../../api";

// Color constants
const MIDNIGHT_BLUE = "#41729f";
const BLUE_GRAY = "#5885af";
const DARK_BLUE = "#274472";
const BABY_BLUE = "#c3e0e5";

function UserWelcome() {
  const [activeTab, setActiveTab] = useState(null);
  const [permissions, setPermissions] = useState({
    dashboard: false,
    devices: false,
    reports: false,
  });

  const decodeEmail = () => {
    try {
      const token = localStorage.getItem("access_token");
      const [, payload] = token.split(".");
      return JSON.parse(atob(payload)).sub;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchUserModules = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const email = decodeEmail();

        const res = await api.get("/users-with-permissions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.find((u) => u.email === email);
        const moduleNames = user?.modules.map((mod) => mod.module_name) || [];

        const hasDashboard = moduleNames.includes("Dashboard");
        const hasDevices = moduleNames.includes("Devices");
        const hasReports = moduleNames.includes("Reports");

        setPermissions({
          dashboard: hasDashboard,
          devices: hasDevices,
          reports: hasReports,
        });

        if (hasDashboard) setActiveTab("dashboard");
        else if (hasDevices) setActiveTab("devices");
        else if (hasReports) setActiveTab("reports");
        else setActiveTab(null);
      } catch (err) {
        console.error("Failed to fetch user permissions", err);
      }
    };

    fetchUserModules();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return permissions.dashboard ? <UserDashboard /> : null;
      case "devices":
        return permissions.devices ? <UserDevices /> : null;
      case "reports":
        return permissions.reports ? <UserReport /> : null;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-blue-100 p-6 rounded-full mb-4">
              <FaBolt className="text-4xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Access Granted
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              You don't have permission to access any modules. Please contact your administrator.
            </p>
          </div>
        );
    }
  };

  const menuItems = [
    permissions.dashboard && {
      key: "dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
    },
    permissions.devices && {
      key: "devices",
      label: "Devices",
      icon: <FaLaptop />,
    },
    permissions.reports && {
      key: "reports",
      label: "Reports",
      icon: <FaFileAlt />,
    },
  ].filter(Boolean);

  return (
    <div className="w-full flex h-[92.95vh]">
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
              <h1 className="text-lg font-bold tracking-wide text-white">IoT User Portal</h1>
              <p className="text-xs text-white/80">User Access</p>
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
          <p className="mt-1">v2.5.0 | User Edition</p>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-[#e7f0ff] to-[#f3f9fd]">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserWelcome;