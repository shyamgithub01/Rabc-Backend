import { useEffect, useState } from "react";
import SuperAdminWelcome from "../components/SuperAdminWelcome";
import AdminWelcome from "../components/AdminWelcome";
import UserWelcome from "../components/UserWelcome";
import { decodeToken } from "../utils/decodeToken";

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

  let welcomeComponent;
  if (role === "superadmin") {
    welcomeComponent = <SuperAdminWelcome />;
  } else if (role === "admin") {
    welcomeComponent = <AdminWelcome />;
  } else if (role === "user") {
    welcomeComponent = <UserWelcome />;
  } else if (!isLoading) {
    welcomeComponent = (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              You don't have a recognized role assigned. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Role-based quick actions
  const getQuickActions = () => {
    switch(role) {
      case "superadmin":
        return [
          { 
            title: "Manage Admins", 
            description: "Create and manage admin accounts", 
            icon: (
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
            color: "bg-blue-50 border-blue-100 hover:border-blue-300"
          },
          { 
            title: "Assign Permissions", 
            description: "Configure module access", 
            icon: (
              <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ),
            color: "bg-indigo-50 border-indigo-100 hover:border-indigo-300"
          },
          { 
            title: "System Settings", 
            description: "Configure application settings", 
            icon: (
              <svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
            color: "bg-amber-50 border-amber-100 hover:border-amber-300"
          }
        ];
      case "admin":
        return [
          { 
            title: "Manage Users", 
            description: "Create and manage user accounts", 
            icon: (
              <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
            color: "bg-green-50 border-green-100 hover:border-green-300"
          },
          { 
            title: "Assign Permissions", 
            description: "Configure user access", 
            icon: (
              <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ),
            color: "bg-purple-50 border-purple-100 hover:border-purple-300"
          },
          { 
            title: "Activity Reports", 
            description: "View user activities", 
            icon: (
              <svg className="h-6 w-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
            color: "bg-cyan-50 border-cyan-100 hover:border-cyan-300"
          }
        ];
      case "user":
        return [
          { 
            title: "My Profile", 
            description: "Update your account details", 
            icon: (
              <svg className="h-6 w-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
            color: "bg-pink-50 border-pink-100 hover:border-pink-300"
          },
          { 
            title: "Recent Activity", 
            description: "View your recent actions", 
            icon: (
              <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            color: "bg-orange-50 border-orange-100 hover:border-orange-300"
          },
          { 
            title: "Assigned Tasks", 
            description: "View your assigned tasks", 
            icon: (
              <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            ),
            color: "bg-teal-50 border-teal-100 hover:border-teal-300"
          }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with user info and logout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold  bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            {userEmail && (
              <div className="flex items-center mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  role === "superadmin" 
                    ? "bg-gradient-to-r from-purple-600 to-indigo-700 text-white"
                    : role === "admin" 
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                }`}>
                  {role?.toUpperCase()}
                </span>
                <p className="text-sm sm:text-base text-gray-600 ml-3">
                  Welcome back, <span className="font-semibold text-gray-800">{userEmail}</span>
                </p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:-translate-y-0.5"
          >
            Logout
            <svg xmlns="" className="h-5 w-5 ml-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-xl">
            <div className="relative">
              <svg 
                className="animate-spin h-12 w-12 text-blue-600" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-600 rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Welcome section with subtle gradient */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-8">
              {welcomeComponent}
            </div>
            
            {/* Role-specific quick actions */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                <div className="text-sm text-gray-500">Tap to navigate</div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {getQuickActions().map((action, index) => (
                  <div 
                    key={index} 
                    className={`p-5 rounded-xl border ${action.color} transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer`}
                  >
                    <div className="flex items-start">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        {action.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats section */}
            
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;