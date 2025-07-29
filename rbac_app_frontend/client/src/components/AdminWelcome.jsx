import React from "react";
import AdminDashboard from "./AdminDashboard";
import AdminCreate from "./AdminCreate";
import UserCreate from "./UserCreate";

function AdminWelcome() {
  return (
    <div className="space-y-8">
      {/* Header with privileges badge */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center justify-center sm:justify-start mb-4 bg-green-100 text-green-800 rounded-full py-1 px-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 0v4m0-4h4m-4 0H8m8 8v4m0-4h-4m4 0h4" />
          </svg>
          <span className="text-sm font-medium">Admin Privileges</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome Admin <span className="text-green-600"></span>
        </h2>

        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
          {/* You can add quick links or stats here */}
        </div>
      </div>

      {/* Dashboard section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Administration Dashboard</h3>
          <div className="text-sm text-green-600 font-medium">Manage Users</div>
        </div>
        <UserCreate/>
        <AdminDashboard />
      </div>
    </div>
  );
}

export default AdminWelcome;
