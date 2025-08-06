import { useEffect, useRef, useState } from "react";
import AdminWelcome from "../components/Admin/AdminWelcome";
import UserWelcome from "../components/Users/UserWelcome";
import decodeToken from "../utils/decodeToken";
import SuperAdminWelcome from "../components/SuperAdmin/SuperAdminWelcome";

// Color constants
const MIDNIGHT_BLUE = "#41729f";
const BLUE_GRAY = "#5885af";
const DARK_BLUE = "#274472";
const BABY_BLUE = "#c3e0e5";

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
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f8ff] to-[#e6f2ff]">
        <div className="flex flex-col items-center">
          <div 
            className="w-14 h-14 rounded-full border-4 border-t-[#274472] border-b-[#41729f]/20 animate-spin mb-4"
            style={{ borderTopColor: DARK_BLUE, borderBottomColor: `${MIDNIGHT_BLUE}20` }}
          ></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-[100vh] flex flex-col min-h-screen"
      style={{ background: `linear-gradient(135deg, ${BABY_BLUE} 0%, #f0f8ff 100%)` }}
    >
      {/* Premium Top Navbar with Blue Gradient */}
      <div 
        className="w-full flex justify-between items-center px-6 py-3 text-white shadow-lg"
        style={{ background: `linear-gradient(90deg, ${DARK_BLUE} 0%, ${MIDNIGHT_BLUE} 100%)` }}
      >
        {/* Left: Dashboard Label */}
        <div className="flex items-center gap-3">
          <div 
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg flex items-center gap-2 shadow-sm"
            style={{ backgroundColor: `${MIDNIGHT_BLUE}30` }}
          >
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
            <span className="text-base font-semibold text-white tracking-tight">
              IoT Control Dashboard
            </span>
          </div>
        </div>

        {/* Right: Notification + Profile */}
        <div className="flex items-center gap-4 relative" ref={profileRef}>
          {/* Notification Icon */}
          <button
            onClick={() => setShowNotificationDot(false)}
            className="relative hover:scale-105 transition-transform group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white group-hover:text-[#c3e0e5] transition-colors"
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
              <span 
                className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-[#274472]"
                style={{ borderColor: DARK_BLUE }}
              ></span>
            )}
          </button>

          {/* Profile Button */}
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-full border-2 border-white/30 px-3 py-1 hover:bg-white/10 transition backdrop-blur-sm group"
            style={{ borderColor: `${BABY_BLUE}60` }}
          >
            <div 
              className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:bg-white/30"
              style={{ backgroundColor: `${BABY_BLUE}30` }}
            >
              <span className="text-white font-bold">
                {userEmail?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden sm:inline-block text-sm font-medium text-white capitalize">
              {getRoleDisplay()}
            </span>
          </button>

          {/* Premium Profile Dropdown */}
          {profileOpen && (
            <div 
              className="absolute right-0 top-12 w-56 bg-white text-black rounded-xl shadow-lg border z-50 overflow-hidden"
              style={{ borderColor: BLUE_GRAY }}
            >
              <div 
                className="p-4"
                style={{ background: `linear-gradient(90deg, ${MIDNIGHT_BLUE} 0%, ${BLUE_GRAY} 100%)` }}
              >
                <p className="text-sm font-semibold text-white">
                  {userEmail}
                </p>
                <p className="text-xs text-[#c3e0e5] font-medium capitalize">
                  {getRoleDisplay()}
                </p>
              </div>
              <ul className="divide-y divide-gray-100">
                <li>
                  <button 
                    className="w-full text-left px-4 py-3 font-medium text-sm text-gray-700 hover:bg-[#c3e0e5] transition-colors"
                    style={{ backgroundColor: `${BABY_BLUE}10` }}
                  >
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={MIDNIGHT_BLUE}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View Profile
                    </div>
                  </button>
                </li>
                <li>
                  <button 
                    className="w-full text-left px-4 py-3 font-medium text-sm text-gray-700 hover:bg-[#c3e0e5] transition-colors"
                    style={{ backgroundColor: `${BABY_BLUE}10` }}
                  >
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={MIDNIGHT_BLUE}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </div>
                  </button>
                </li>
                <li>
                  <button 
                    className="w-full text-left px-4 py-3 font-medium text-sm text-gray-700 hover:bg-[#c3e0e5] transition-colors"
                    style={{ backgroundColor: `${BABY_BLUE}10` }}
                  >
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={MIDNIGHT_BLUE}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Help & Support
                    </div>
                  </button>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 font-medium text-sm text-white hover:bg-[#274472] transition-colors"
                    style={{ backgroundColor: MIDNIGHT_BLUE }}
                  >
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Main Content with Subtle Pattern */}
      <div 
        className="flex-1 overflow-auto relative"
        style={{ background: `linear-gradient(135deg, ${BABY_BLUE}20 0%, #f8fcff 100%)` }}
      >
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-10 z-0">
          <div className="pattern-dots pattern-blue-500 pattern-bg-transparent pattern-opacity-20 pattern-size-4 w-full h-full"></div>
        </div>
        
        <div className="relative z-10">
          {role === "superadmin" && <SuperAdminWelcome />}
          {role === "admin" && <AdminWelcome />}
          {role === "user" && <UserWelcome />}
          {!["superadmin", "admin", "user"].includes(role) && (
            <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-67px)]">
              <div 
                className="text-center p-8 rounded-2xl shadow-lg border max-w-md backdrop-blur-sm"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderColor: BLUE_GRAY,
                  boxShadow: `0 10px 30px -10px ${MIDNIGHT_BLUE}40`
                }}
              >
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: `linear-gradient(135deg, ${MIDNIGHT_BLUE} 0%, ${DARK_BLUE} 100%)` }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                </div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: DARK_BLUE }}
                >
                  Invalid Role
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Your account role is not recognized. Please contact our support team for assistance.
                </p>
                <button
                  onClick={logout}
                  className="text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                  style={{ 
                    background: `linear-gradient(90deg, ${MIDNIGHT_BLUE} 0%, ${DARK_BLUE} 100%)`,
                    boxShadow: `0 4px 15px ${MIDNIGHT_BLUE}50`
                  }}
                >
                  Return to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;