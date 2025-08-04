import { useEffect, useState } from "react";

import AdminWelcome from "../components/Admin/AdminWelcome";
import UserWelcome from "../components/Users/UserWelcome";
import decodeToken from "../utils/decodeToken";
import SuperAdminWelcome from "../components/SuperAdmin/SuperAdminWelcome";

function Dashboard({ logout }) {
  const [role, setRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const getPanelTitle = () => {
    if (role === "superadmin") return "Super Admin Panel";
    if (role === "admin") return "Admin Panel";
    if (role === "user") return "User Panel";
    return "Dashboard";
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#e7f0ff] to-[#f3f9fd]">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-[100vw] h-[100vh] bg-gradient-to-br from-[#e7f0ff] to-[#f3f9fd] flex flex-col">
      {/* Top Navbar */}
      <div className="w-full flex justify-between items-center px-6 py-4 border-b border bg-gray-50">
        {/* Left Side - Title & Welcome */}
        <div className="flex items-center gap-6">
          <div className="   font-bold  text-2xl  ">
            {getPanelTitle()}
          </div>

          {userEmail && (
            <div className=" text-sm text-black px-4 py-2  flex items-center ">
              <span className="mr-1">Welcome,</span>
              <span className="font-semibold text-black">{userEmail}</span>
            </div>
          )}
        </div>

        {/* Right Side - Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border-2 border-red-600 rounded-2xl hover:bg-red-50 hover:-translate-y-[2px] transition-all duration-200 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7"
            />
          </svg>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white  overflow-auto">
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
