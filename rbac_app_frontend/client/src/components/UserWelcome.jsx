import React, { useState } from "react";
import UserDashboard from "./UserDashboard";
import { FaTachometerAlt } from "react-icons/fa";

function UserWelcome() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
      default:
        return (
          <div className="space-y-8">
            <div className="">
              <UserDashboard />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white text-black flex-shrink-0">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold">User Portal</h1>
        </div>

        <div className="p-4">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">
            Navigation
          </h2>
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
                  My Dashboard
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                User Dashboard
              </h1>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserWelcome;
