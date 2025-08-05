import React, { useEffect, useState } from "react";
import UserDashboard from "./UserDashboard";
import UserDevices from "./UserDevices";
import UserReport from "./UserReports";

import {
  FaTachometerAlt,
  FaLaptop,
  FaFileAlt,
} from "react-icons/fa";
import api from "../../api";

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
          <div className="text-gray-600 p-6 text-center">
            You don’t have access to any modules.
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
    <div
      className="w-full flex bg-gradient-to-br from-[#e7f0ff] to-[#f3f9fd] overflow-x-hidden"
      style={{ height: "calc(100vh - 67px)" }}
    >
      {/* Static Sidebar */}
      <div className="w-60 bg-gray-900 text-white flex flex-col border-r border-gray-200">
        <div className="px-6 py-5 border-b border-gray-800">
          <h1 className="text-lg font-bold tracking-wide text-white">IoT Portal</h1>
          <p className="text-xs text-gray-400">User Access</p>
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
          &copy; {new Date().getFullYear()} IoT Solutions
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full bg-white overflow-y-auto text-black">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default UserWelcome;
