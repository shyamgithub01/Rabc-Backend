import React, { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminReports from "./AdminReports";
import AdminDevices from "./AdminDevices";
import AdminUsers from "./AdminUsers";

import {
  FaTachometerAlt,
  FaChartBar,
  FaLaptop,
  FaUsers,
} from "react-icons/fa";

import api from "../../api";
import decodeToken from "../../utils/decodeToken";

function AdminWelcome() {
  const [activeTab, setActiveTab] = useState(null);
  const [modules, setModules] = useState([]);

  const MODULE_MAP = {
    Dashboard: 23,
    MQTT: 24,
    S7: 25,
    RDBMS: 26,
    Reports: 27,
    Devices: 28,
    Users: 29,
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const decoded = decodeToken(token);
        const myEmail = decoded?.sub;

        const res = await api.get("/users-with-permissions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const me = res.data.find((u) => u.email === myEmail);
        const userModules = me?.modules || [];
        setModules(userModules);

        const moduleNames = userModules.map((mod) => mod.module_name);
        const hasDashboard = moduleNames.includes("Dashboard");
        const hasReports = moduleNames.includes("Reports");
        const hasDevices = moduleNames.includes("Devices"); // ✅ updated
        const hasUsers = moduleNames.includes("Users");

        if (hasDashboard) setActiveTab("dashboard");
        else if (hasReports) setActiveTab("reports");
        else if (hasDevices) setActiveTab("devices");
        else if (hasUsers) setActiveTab("users");
        else setActiveTab(null);
      } catch (err) {
        console.error("Failed to fetch permissions", err);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermissionFor = (moduleName) =>
    modules.some((mod) => mod.module_name === moduleName);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "reports":
        return <AdminReports />;
      case "devices":
        const allowedSubModules = modules
          .filter((mod) => ["MQTT", "S7", "RDBMS"].includes(mod.module_name))
          .map((mod) => mod.module_name);
        return <AdminDevices allowedSubModules={allowedSubModules} />;
      case "users":
        return <AdminUsers />;
      default:
        return (
          <div className="text-gray-600 p-6 text-center">
            You don’t have access to any modules.
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white text-black flex-shrink-0 shadow-md border-r border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
        </div>

        <div className="p-4">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">
            Navigation
          </h2>
          <nav>
            <ul className="space-y-1">
              {hasPermissionFor("Dashboard") && (
                <li>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`w-full text-left py-2.5 px-4 flex items-center rounded-md ${
                      activeTab === "dashboard"
                        ? "bg-gray-700 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaTachometerAlt className="mr-3" />
                    Dashboard
                  </button>
                </li>
              )}

              {hasPermissionFor("Reports") && (
                <li>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`w-full text-left py-2.5 px-4 flex items-center rounded-md ${
                      activeTab === "reports"
                        ? "bg-gray-700 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaChartBar className="mr-3" />
                    Reports
                  </button>
                </li>
              )}

              {hasPermissionFor("Devices") && (
                <li>
                  <button
                    onClick={() => setActiveTab("devices")}
                    className={`w-full text-left py-2.5 px-4 flex items-center rounded-md ${
                      activeTab === "devices"
                        ? "bg-gray-700 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaLaptop className="mr-3" />
                    Devices
                  </button>
                </li>
              )}

              {hasPermissionFor("Users") && (
                <li>
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`w-full text-left py-2.5 px-4 flex items-center rounded-md ${
                      activeTab === "users"
                        ? "bg-gray-700 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaUsers className="mr-3" />
                    Users
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default AdminWelcome;
