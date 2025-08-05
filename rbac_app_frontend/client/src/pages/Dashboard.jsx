import { useEffect, useRef, useState } from "react";

import AdminWelcome from "../components/Admin/AdminWelcome";
import UserWelcome from "../components/Users/UserWelcome";
import decodeToken from "../utils/decodeToken";
import SuperAdminWelcome from "../components/SuperAdmin/SuperAdminWelcome";

function Dashboard({ logout }) {
  const [role, setRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showNotificationDot, setShowNotificationDot] = useState(true);
  const profileRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const decoded = decodeToken(token);
    const email = decoded?.sub;
    const userRole = decoded?.role;

    if (email && userRole) {
      setUserEmail(email);
      setRole(userRole);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleDisplay = () => {
    if (role === "superadmin") return "Super Admin";
    if (role === "admin") return "Admin";
    if (role === "user") return "User";
    return "User";
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#e7f0ff] to-[#f3f9fd]">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#e7f0ff] to-[#f3f9fd] flex flex-col">
      {/* Top Navbar (Dark Themed) */}
      <div className="w-full flex justify-between items-center px-6 py-3 bg-gray-900 text-white shadow-sm border-b border-gray-800">
        {/* Left: Static Dashboard Label */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-800 text-white rounded-lg flex items-center gap-2 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 6.75h4.5M10.5 10.5h3m-6.876 7.374a9 9 0 1112.752 0L12 21.75l-5.376-3.876z"
              />
            </svg>
            <span className="text-base font-semibold tracking-tight">
              IoT Control Dashboard
            </span>
          </div>
        </div>

        {/* Right: Notification + Profile */}
        <div className="flex items-center gap-4 relative" ref={profileRef}>
          {/* Notification Icon */}
          <button
            onClick={() => setShowNotificationDot(false)}
            className="relative hover:scale-105 transition-transform"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9"
              />
            </svg>
            {showNotificationDot && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900"></span>
            )}
          </button>

          {/* Profile Button */}
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-full border border-gray-700 px-3 py-1 hover:bg-gray-800 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="hidden sm:inline-block text-sm font-medium text-white capitalize">
              {getRoleDisplay()}
            </span>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white text-black rounded-xl shadow-lg border z-50">
              <div className="p-4 border-b">
                <p className="text-sm font-semibold text-gray-900">
                  {userEmail}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {getRoleDisplay()}
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                <li>
                  <button className="w-full text-left px-4 py-3 font-semibold text-sm text-gray-800 hover:bg-gray-100 rounded-md">
                    View Profile
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-3 font-semibold text-sm text-gray-800 hover:bg-gray-100 rounded-md">
                    Settings
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-3 font-semibold text-sm text-gray-800 hover:bg-gray-100 rounded-md">
                    Help & Support
                  </button>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 font-semibold text-sm text-red-600 hover:bg-red-50 rounded-b-2xl"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white overflow-auto">
        {role === "superadmin" && <SuperAdminWelcome />}
        {role === "admin" && <AdminWelcome />}
        {role === "user" && <UserWelcome />}
        {!["superadmin", "admin", "user"].includes(role) && (
          <p className="text-red-600">Invalid role. Please contact support.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
