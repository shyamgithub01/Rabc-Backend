import React, { useState, useEffect } from "react";
import api from "../../api";
import UserDevices from "../Users/UserDevices";
import UserReport from "../Users/UserReports";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-14 h-14 rounded-full border-4 border-t-yellow-600 border-b-yellow-200 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-5 ml-3 px-4 sm:px-6 max-w-lvw mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Your Access</h2>
        <p className="text-sm text-gray-500 mt-1">
          You have access to{" "}
          <span className="font-semibold">{modules.length}</span> modules and{" "}
          <span className="font-semibold">{totalPermissions}</span> permissions.
        </p>
      </div>

      {/* Permissions Table */}
      <div className="overflow-x-auto border rounded-xl shadow-lg bg-white mb-10">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Module</th>
              <th className="px-6 py-4 font-semibold">Permissions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {modules.map((mod) => (
              <tr key={mod.module_name} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                  {mod.module_name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {mod.permissions.map((perm) => (
                      <PermissionBadge key={perm} permission={perm} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Conditional Modules */}
      {hasViewPermission("Devices") && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Devices Module
          </h3>
          <UserDevices />
        </div>
      )}

      {hasViewPermission("Reports") && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Reports Module
          </h3>
          <UserReport />
        </div>
      )}
    </div>
  );
}
