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
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import api from "../../api";
import decodeToken from "../../utils/decodeToken";

function AdminWelcome() {
  const [activeTab, setActiveTab] = useState(null);
  const [modules, setModules] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const MODULE_MAP = {
    Dashboard: 30,
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
        const hasDevices = moduleNames.includes("Devices");
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
    <div className="w-screen h-[90vh] flex bg-gradient-to-br from-[#e7f0ff] to-[#f3f9fd] overflow-hidden m-0 p-0">
      {/* Sidebar with smoother animation */}
      <div
        className={`transition-all duration-[800ms] ease-in-out bg-white text-black flex-shrink-0 shadow-md border-r border-gray-200 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-900 relative">
          {sidebarOpen && (
            <span className="ml-3 font-bold text-xl text-gray-800 flex space-x-[1px] overflow-hidden">
              {"Access Rights".split("").map((char, index) => (
                <span
                  key={index}
                  className="text-base opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 50 + 200}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          )}
          <button
            className="absolute mt-150 ml-4 -right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow border text-gray-600 hover:text-gray-800 hover:scale-110 transition-all z-10"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaChevronLeft size={22} /> : <FaChevronRight size={22} />}
          </button>
        </div>

        <div className="p-4">
          <h2
            className={`text-sm uppercase tracking-wider text-gray-400 mb-3 ${
              sidebarOpen ? "block" : "hidden"
            }`}
          >
            Navigation
          </h2>
          <nav>
            <ul className="space-y-2">
              {hasPermissionFor("Dashboard") && (
                <li>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`w-full flex rounded-md font-medium transition-all duration-[400ms] ease-in-out px-3 py-2.5 ${
                      activeTab === "dashboard"
                        ? "min-w-xl bg-black text-white font-semibold"
                        : "text-gray-700 min-w-xl hover:bg-gray-100"
                    }`}
                  >
                    <span className="min-w-[1rem] text-xl flex justify-center items-center">
                      <FaTachometerAlt />
                    </span>
                    {sidebarOpen && (
                      <span className="ml-3 flex space-x-[1px] overflow-hidden">
                        {"Dashboard".split("").map((char, index) => (
                          <span
                            key={index}
                            className="text-base opacity-0 animate-fade-in"
                            style={{
                              animationDelay: `${index * 50 + 300}ms`,
                              animationFillMode: "forwards",
                            }}
                          >
                            {char === " " ? "\u00A0" : char}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                </li>
              )}
              {hasPermissionFor("Reports") && (
                <li>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`w-full flex rounded-md font-medium transition-all duration-[800ms] ease-in-out px-3 py-2.5 ${
                      activeTab === "reports"
                        ? "min-w-xl bg-black text-white font-semibold"
                        : "text-gray-700 min-w-xl hover:bg-gray-100"
                    }`}
                  >
                    <span className="min-w-[1rem]  text-xl flex justify-center items-center">
                      <FaChartBar />
                    </span>
                    {sidebarOpen && (
                      <span className="ml-3 flex space-x-[1px] overflow-hidden">
                        {"Reports".split("").map((char, index) => (
                          <span
                            key={index}
                            className="text-base opacity-0 animate-fade-in"
                            style={{
                              animationDelay: `${index * 50 + 300}ms`,
                              animationFillMode: "forwards",
                            }}
                          >
                            {char === " " ? "\u00A0" : char}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                </li>
              )}
              {hasPermissionFor("Devices") && (
                <li>
                  <button
                    onClick={() => setActiveTab("devices")}
                    className={`w-full flex rounded-md font-medium transition-all duration-[800ms] ease-in-out px-3 py-2.5 ${
                      activeTab === "devices"
                        ? " min-w-xl bg-black text-white font-semibold"
                        : "text-gray-700 min-w-xl hover:bg-gray-100"
                    }`}
                  >
                    <span className="min-w-[1rem]  text-xl flex justify-center items-center">
                      <FaLaptop />
                    </span>
                    {sidebarOpen && (
                      <span className="ml-3 flex space-x-[1px] overflow-hidden">
                        {"Devices".split("").map((char, index) => (
                          <span
                            key={index}
                            className="text-base opacity-0 animate-fade-in"
                            style={{
                              animationDelay: `${index * 50 + 300}ms`,
                              animationFillMode: "forwards",
                            }}
                          >
                            {char === " " ? "\u00A0" : char}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                </li>
              )}
              {hasPermissionFor("Users") && (
                <li>
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`w-full flex rounded-md font-medium transition-all duration-[800ms] ease-in-out px-3 py-2.5 ${
                      activeTab === "users"
                        ? "min-w-xl bg-black text-white font-semibold"
                        : "text-gray-700 min-w-xl hover:bg-gray-100"
                    }`}
                  >
                    <span className="min-w-[1rem]  text-xl flex justify-center items-center">
                      <FaUsers />
                    </span>
                    {sidebarOpen && (
                      <span className="ml-3 flex space-x-[1px] overflow-hidden">
                        {"Users".split("").map((char, index) => (
                          <span
                            key={index}
                            className="text-base opacity-0 animate-fade-in"
                            style={{
                              animationDelay: `${index * 50 + 300}ms`,
                              animationFillMode: "forwards",
                            }}
                          >
                            {char === " " ? "\u00A0" : char}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full bg-white overflow-y-auto text-black">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-6">{renderContent()}</div>
        </div>
      </div>

      {/* Inline CSS for animations */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}
      </style>
    </div>
  );
}

export default AdminWelcome;