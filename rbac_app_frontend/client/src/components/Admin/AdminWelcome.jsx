import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminReports from "./AdminReports";
import AdminDevices from "./AdminDevices";
import AdminUsers from "./AdminUsers";

import { 
  FaTachometerAlt, 
  FaChartBar, 
  FaLaptop, 
  FaUsers,
  FaCog, 
  FaSignOutAlt 
} from "react-icons/fa";

function AdminWelcome() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch(activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "reports":
        return <AdminReports />;
      case "devices":
        return <AdminDevices />;
      case "users":
        return <AdminUsers />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-white text-black flex-shrink-0">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Portal</h1>
        </div>
        
        <div className="p-4">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Navigation</h2>
          <nav>
            <ul className="space-y-1">
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
            </ul>
          </nav>
          
          {/* Bottom settings/logout */}
          
          
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          <div className="pb-8 pt-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminWelcome;