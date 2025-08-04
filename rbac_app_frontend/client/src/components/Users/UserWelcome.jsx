import React, { useState } from "react";
import UserDashboard from "./UserDashboard";
import { FaChevronLeft, FaChevronRight, FaTachometerAlt, FaLaptop, FaFileAlt } from "react-icons/fa";
import UserDevices from "./UserDevices";
import UserReports from "./UserReports";

function UserWelcome({ permissions = { dashboard: true, devices: true, reports: true } }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return permissions.dashboard ? <UserDashboard /> : null;
      case "devices":
        return permissions.devices ? <UserDevices/> : null;
      case "reports":
        return permissions.reports ? <UserReports/> : null;
      default:
        return <div className="text-gray-600 p-6 text-center">You don’t have access to any modules.</div>;
    }
  };

  return (
    <div className="w-screen h-[90vh] flex bg-gradient-to-br from-[#e7f0ff] to-[#f3f9fd] overflow-hidden m-0 p-0">
      {/* Sidebar */}
      <div
        className={`transition-all duration-[800ms] ease-in-out bg-white text-black border-r border-gray-200 shadow-md ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-900 relative">
          {sidebarOpen && (
            <span className="ml-3 font-bold mt-2 flex space-x-[1px] overflow-hidden">
              {"User Portal".split("").map((char, index) => (
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
              {permissions.dashboard && (
                <li>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`w-full mt-6 flex rounded-md font-medium transition-all duration-[800ms] ease-in-out px-3 py-2 ${
                      activeTab === "dashboard"
                        ? "min-w-xl bg-gray-900 text-white font-semibold"
                        : "text-gray-700 min-w-xl hover:bg-gray-100"
                    }`}
                  >
                    <span className="min-w-[1.75rem] text-xl flex justify-center items-center">
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
              {permissions.devices && (
                <li>
                  <button
                    onClick={() => setActiveTab("devices")}
                    className={`w-full flex rounded-md font-medium transition-all duration-[800ms] ease-in-out px-3 py-2 ${
                      activeTab === "devices"
                        ? "min-w-xl bg-gray-900 text-white font-semibold"
                        : "text-gray-700 min-w-xl hover:bg-gray-100"
                    }`}
                  >
                    <span className="min-w-[1.75rem] text-xl flex justify-center items-center">
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
              {permissions.reports && (
                <li>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`w-full flex rounded-md font-medium transition-all duration-[800ms] ease-in-out px-3 py-2 ${
                      activeTab === "reports"
                        ? "min-w-xl bg-gray-900 text-white font-semibold"
                        : "text-gray-700 min-w-xl hover:bg-gray-100"
                    }`}
                  >
                    <span className="min-w-[1.75rem] text-xl flex justify-center items-center">
                      <FaFileAlt />
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

     
    </div>
  );
}

export default UserWelcome;
