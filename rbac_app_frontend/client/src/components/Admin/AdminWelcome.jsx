import React, { useEffect, useState, useMemo } from "react";
import {
  FaHome,
  FaUsers,
  FaChartBar,
  FaLaptop,
  FaMicrochip,
  FaDatabase,
  FaProjectDiagram,
} from "react-icons/fa";
import AdminDashboard from "./AdminDashboard";
import AdminReports from "./AdminReports";
import AdminDevices from "./AdminDevices";
import AdminUsers from "./AdminUsers";
import api from "../../api";
import decodeToken from "../../utils/decodeToken";

function AdminWelcome() {
  const [activeTab, setActiveTab] = useState(null);
  const [modules, setModules] = useState([]);

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
        if (moduleNames.includes("Dashboard")) setActiveTab("dashboard");
        else if (moduleNames.includes("Reports")) setActiveTab("reports");
        else if (moduleNames.includes("Devices")) setActiveTab("devices");
        else if (moduleNames.includes("Users")) setActiveTab("users");
        else setActiveTab(null);
      } catch (err) {
        console.error("Failed to fetch permissions", err);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermissionFor = useMemo(
    () => (moduleName) => modules.some((mod) => mod.module_name === moduleName),
    [modules]
  );

  const allowedSubModules = useMemo(
    () =>
      modules
        .filter((mod) => ["MQTT", "S7", "RDBMS"].includes(mod.module_name))
        .map((mod) => mod.module_name),
    [modules]
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "reports":
        return <AdminReports />;
      case "devices":
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

  const menuItems = [
    hasPermissionFor("Dashboard") && {
      key: "dashboard",
      label: "Dashboard",
      icon: <FaHome />,
    },
    hasPermissionFor("Reports") && {
      key: "reports",
      label: "Reports",
      icon: <FaChartBar />,
    },
    hasPermissionFor("Devices") && {
      key: "devices",
      label: "Devices",
      icon: <FaLaptop />,
    },
    hasPermissionFor("Users") && {
      key: "users",
      label: "Users",
      icon: <FaUsers />,
    },
  ].filter(Boolean); // removes `false` if permission not granted

  return (
    <div
      className="w-full flex bg-gradient-to-br from-[#e7f0ff] to-[#f3f9fd] overflow-x-hidden"
      style={{ height: "calc(100vh - 67px)" }}
    >
      {/* Static Sidebar */}
      <div className="w-60 bg-gray-900 text-white flex flex-col border-r border-gray-200">
        <div className="px-6 py-5 border-b border-gray-800">
          <h1 className="text-lg font-bold tracking-wide text-white">
            IoT Admin Panel
          </h1>
          <p className="text-xs text-gray-400">Admin Access</p>
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

export default AdminWelcome;
