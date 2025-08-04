import React, { useState } from "react";
import SuperAdminDashboard from "./SuperAdminDashboard";
import { FaChevronLeft, FaChevronRight, FaBriefcase } from "react-icons/fa";

function SuperAdminWelcome() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    return <SuperAdminDashboard />;
  };

  return (
    <div className="w-screen h-[90vh] flex bg-gradient-to-br from-[#e7f0ff] to-[#f3f9fd] overflow-hidden m-0 p-0">
      {/* Sidebar with smoother animation */}
      <div
        className={`transition-all duration-[800ms] ease-in-out bg-white text-black border-r border-gray-200 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-900 relative">
          {sidebarOpen && (
            <span className="ml-3 font-bold mt-2 flex space-x-[1px] overflow-hidden">
              {"Empower Control".split("").map((char, index) => (
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
          <button
            className="absolute mt-150 ml-4 -right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow border text-gray-600 hover:text-gray-800 hover:scale-110 transition-all z-10"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaChevronLeft size={22} /> : <FaChevronRight size={22} />}
          </button>
        </div>

        <div className="p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full mt-6 flex rounded-md font-medium transition-all duration-[800ms] ease-in-out px-3 py-2 ${
                    activeTab === "dashboard"
                      ? "bg-white text-black font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="min-w-[1.75rem] text-xl flex justify-center items-center">
                    <FaBriefcase />
                  </span>
                  {sidebarOpen && (
                    <span className="ml-3 flex space-x-[1px] overflow-hidden">
                      {"Manage Admins".split("").map((char, index) => (
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
            </ul>
          </nav>
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
