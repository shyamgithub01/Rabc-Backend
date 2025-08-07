import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";
import UserDevices from "../Users/UserDevices";
import UserReport from "../Users/UserReports";

// Color constants
const MIDNIGHT_BLUE = "#41729f";
const BLUE_GRAY = "#5885af";
const DARK_BLUE = "#274472";
const BABY_BLUE = "#c3e0e5";

const PermissionBadge = ({ permission }) => {
  const colorMap = {
    view: "bg-blue-100 text-blue-800 border-blue-200",
    edit: "bg-yellow-100 text-yellow-800 border-yellow-200",
    add: "bg-green-100 text-green-800 border-green-200",
    delete: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium border rounded-full shadow-sm capitalize ${
        colorMap[permission] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {permission}
    </span>
  );
};

export default function UserDashboard() {
  const [user, setUser] = useState({ email: "", role: "", created_by: null });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const decodeEmail = () => {
    try {
      const token = localStorage.getItem("access_token");
      const [, payload] = token.split(".");
      return JSON.parse(atob(payload)).sub;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const meEmail = decodeEmail();
        const res = await api.get("/users-with-permissions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        const me = res.data.find((u) => u.email === meEmail) || {};
        setUser(me);
        setModules(me.modules || []);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasViewPermission = (moduleName) => {
    const mod = modules.find((m) => m.module_name === moduleName);
    return mod?.permissions.includes("view");
  };

  const totalPermissions = modules.reduce(
    (sum, mod) => sum + mod.permissions.length,
    0
  );

  const filteredModules = modules.filter((mod) =>
    mod.module_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border mx-4 sm:mx-6"
        style={{ borderColor: BABY_BLUE }}
      >
        <div className="flex flex-col items-center">
          <div
            className="w-14 h-14 rounded-full border-4 border-t-[#274472] border-b-[#41729f]/20 animate-spin mb-4"
            style={{
              borderTopColor: DARK_BLUE,
              borderBottomColor: `${MIDNIGHT_BLUE}20`,
            }}
          ></div>
          <p className="text-gray-600 font-medium">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-sm mx-4 sm:mx-6">
        <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-red-600">Error Loading Data</h3>
        <p className="text-red-700 mt-2 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-white py-2 px-5 rounded-lg font-medium transition-all hover:shadow-md"
          style={{
            background: `linear-gradient(90deg, ${MIDNIGHT_BLUE} 0%, ${BLUE_GRAY} 100%)`,
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pt-5 relative">
      {/* Premium Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4 px-3 sm:px-6">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: DARK_BLUE }}
          >
            Your Access Dashboard
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            View and manage your permissions and modules
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => window.location.reload()}
            title="Refresh"
            className="p-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:rotate-180"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.333-2.707A9 9 0 016.582 18.418M4 20v-5h.582"
              />
            </svg>
          </button>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 w-full shadow-sm transition-all"
              style={{
                borderColor: BABY_BLUE,
                focusBorderColor: MIDNIGHT_BLUE,
                focusRingColor: `${MIDNIGHT_BLUE}20`,
              }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Cards with Premium Design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2 px-4 sm:px-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
          style={{ borderColor: BABY_BLUE }}
        >
          <div className="flex items-center">
            <div className="flex items-center">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${MIDNIGHT_BLUE}10` }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={MIDNIGHT_BLUE}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Your Email</p>
                <p className="text-xl font-bold text-gray-800 truncate">
                  {user.email || "Not available"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
          style={{ borderColor: BABY_BLUE }}
        >
          <div className="flex items-center">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${BLUE_GRAY}10` }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke={BLUE_GRAY}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Accessible Modules</p>
              <p className="text-xl font-bold text-gray-800">
                {modules.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
          style={{ borderColor: BABY_BLUE }}
        >
          <div className="flex items-center">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${DARK_BLUE}10` }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke={DARK_BLUE}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Permissions</p>
              <p className="text-xl font-bold text-gray-800">
                {totalPermissions}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Permissions Table */}
      <div
        className="bg-white h-[68.5vh] rounded-2xl shadow-sm border overflow-hidden mx-4 sm:mx-6"
        style={{ borderColor: BABY_BLUE }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 sm:mb-0">
            Your Permissions
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table
            className="min-w-full divide-y text-sm"
            style={{ divideColor: "rgba(195,224,229,0.5)" }}
          >
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500 text-left text-xs uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-left text-xs uppercase tracking-wider">
                  Permissions
                </th>
              </tr>
            </thead>
            <tbody
              className="bg-white divide-y"
              style={{ divideColor: "rgba(195,224,229,0.5)" }}
            >
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan="2" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ background: "rgba(195,224,229,0.3)" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="#41729f"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-base font-medium text-gray-600">
                        No modules found
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {searchTerm ? "Try a different search" : "You don't have access to any modules"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredModules.map((mod) => (
                  <tr
                    key={mod.module_name}
                    className="hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {mod.module_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {mod.permissions.map((perm) => (
                          <PermissionBadge key={perm} permission={perm} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conditional Modules */}
      <AnimatePresence>
        {hasViewPermission("Devices") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-4 sm:mx-6 mt-6"
          >
            <div
              className="bg-white rounded-2xl shadow-sm border overflow-hidden"
              style={{ borderColor: BABY_BLUE }}
            >
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Devices Module
                </h3>
              </div>
              <div className="p-6">
                <UserDevices />
              </div>
            </div>
          </motion.div>
        )}

        {hasViewPermission("Reports") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-4 sm:mx-6 mt-6"
          >
            <div
              className="bg-white rounded-2xl shadow-sm border overflow-hidden"
              style={{ borderColor: BABY_BLUE }}
            >
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Reports Module
                </h3>
              </div>
              <div className="p-6">
                <UserReport />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}