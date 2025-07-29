import React from "react";
import UserCreate from "./UserCreate";
import UserDashboard from "./UserDashboard";

function UserWelcome() {
  return (
    <div className="space-y-8">
      

      {/* Access badge and welcome */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center justify-center sm:justify-start mb-4 bg-yellow-100 text-yellow-800 rounded-full py-1 px-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A4 4 0 0112 14a4 4 0 016.879 3.804A9 9 0 1012 3a9 9 0 00-6.879 14.804z"
            />
          </svg>
          <span className="text-sm font-medium">User Access</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome User <span className="text-yellow-600">😊</span>
        </h2>
        <p className="mt-2 text-gray-600">Here are your modules and permissions:</p>
      </div>

      {/* Dashboard section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">My Dashboard</h3>
          <div className="text-sm text-yellow-600 font-medium">Limited Access</div>
        </div>
        <UserDashboard />
      </div>
    </div>
  );
}

export default UserWelcome;