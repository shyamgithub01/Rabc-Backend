// Modified SuperAdminWelcome.jsx with AdminCreate modal
import React, { useState } from "react";
import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminCreate from "./AdminCreate";
import { FaUserPlus, FaTachometerAlt, FaCog } from "react-icons/fa";

function SuperAdminWelcome() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "settings":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">System Settings</h3>
            <p className="text-gray-600">System configuration options will appear here.</p>
          </div>
        );
      default:
        return <SuperAdminDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white text-black flex-shrink-0">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Portal</h1>
        </div>

        <div className="p-4">
          <h2 className="text-sm uppercase tracking-wider text-black mb-3">Navigation</h2>
          <nav>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full text-left py-2.5 px-4 flex items-center rounded-md ${
                    activeTab === "dashboard"
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <FaTachometerAlt className="mr-3" />
                  Manage Admins
                </button>
              </li>
              
              <li>
                
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          
          <div className="pb-8">{renderContent()}</div>
        </div>
      </div>

      {/* AdminCreate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <AdminCreate />
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminWelcome;
