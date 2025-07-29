import React from "react";
import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminCreate from "./AdminCreate";

function SuperAdminWelcome() {
  return (
    <div className="space-y-8">
      {/* Create Admin Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Admin</h3>
        
      </div>

      {/* Superadmin Welcome Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center justify-center sm:justify-start mb-4 bg-indigo-100 text-indigo-800 rounded-full py-1 px-4">
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
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          <span className="text-sm font-medium">Superadmin Privileges</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome Superadmin
        </h2>

        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
          {/* quick links or stats could go here */}
        </div>
      </div>

      {/* Administration Dashboard Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Administration Dashboard</h3>
          <div className="text-sm text-indigo-600 font-medium">Full Access</div>
        </div>
        <AdminCreate/>
        <SuperAdminDashboard />
      </div>
    </div>
  );
}

export default SuperAdminWelcome;