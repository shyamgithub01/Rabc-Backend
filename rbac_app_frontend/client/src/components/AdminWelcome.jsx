import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";

import { FaUserPlus, FaTachometerAlt, FaUsers, FaCog, FaSignOutAlt } from "react-icons/fa";

function AdminWelcome() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch(activeTab) {
      case "create":
        return <UserCreate />;
      case "dashboard":
      default:
        return (
          <div className="mt-2  rounded-lg">
            
            <AdminDashboard />
          </div>
        );
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
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <FaTachometerAlt className="mr-3" />
                  Manage Users
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
          {/* Page Header */}
          
          
          {/* Content Area */}
          <div className="pb-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminWelcome;