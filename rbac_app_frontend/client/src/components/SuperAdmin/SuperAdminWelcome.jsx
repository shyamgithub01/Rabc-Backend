import React, { useState } from "react";
import { FaHome, FaUsers, FaCogs, FaTools, FaChartBar, FaChevronRight, FaBriefcase, FaRegLifeRing } from "react-icons/fa";
import SuperAdminDashboard from "./SuperAdminDashboard";

function SuperAdminWelcome() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    return <SuperAdminDashboard />;
  };

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { key: "manage-admins", label: "Manage Admins", icon: <FaBriefcase /> },
    { key: "manage-users", label: "Manage Users", icon: <FaUsers /> },
    { key: "device-logs", label: "Device Logs", icon: <FaTools /> },
    { key: "analytics", label: "Analytics", icon: <FaChartBar /> },
    { key: "settings", label: "Settings", icon: <FaCogs /> },
    { key: "support", label: "Support", icon: <FaRegLifeRing /> },
  ];

  return (
    <div
  className="w-full flex bg-gradient-to-br from-[#e7f0ff] to-[#f3f9fd] overflow-x-hidden"
  style={{ height: "calc(100vh - 67px)" }}
>

      {/* Static Sidebar */}
      <div className="w-60 bg-gray-900 text-white flex flex-col border-r border-gray-200">
        <div className="px-6 py-5 border-b border-gray-800">
          <h1 className="text-lg font-bold tracking-wide text-white">IoT Admin Panel</h1>
          <p className="text-xs text-gray-400">Super Admin Access</p>
        </div>

        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    activeTab === item.key
                      ? "bg-white text-gray-900 font-semibold shadow-sm"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <span className="mr-3 text-base">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-4 py-4 text-xs text-gray-500 border-t border-gray-800">
          &copy; {new Date().getFullYear()} IoT Business Solutions
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full bg-white overflow-y-auto text-black">
        {renderContent()}
      </div>
    </div>
  );
}

export default SuperAdminWelcome;
