import React, { useState, useEffect } from "react";
import api from "../../api";

const PermissionBadge = ({ permission }) => {
  const colorMap = {
    view: "bg-blue-100 text-blue-800 border-blue-200",
    edit: "bg-yellow-100 text-yellow-800 border-yellow-200",
    create: "bg-green-100 text-green-800 border-green-200",
    delete: "bg-red-100 text-red-800 border-red-200",
    manage: "bg-purple-100 text-purple-800 border-purple-200",
    admin: "bg-indigo-100 text-indigo-800 border-indigo-200",
    export: "bg-teal-100 text-teal-800 border-teal-200",
    analyze: "bg-pink-100 text-pink-800 border-pink-200",
    configure: "bg-gray-100 text-gray-800 border-gray-200"
  };
  return (
    <span className={`inline-block px-3 py-1 text-xs font-medium border rounded-full ${colorMap[permission]}`}>{permission}</span>
  );
};

export default function UserDashboard() {
  const [user, setUser] = useState({ email: '', role: '', created_by: null });
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
    (async () => {
      setLoading(true);
      try {
        const meEmail = decodeEmail();
        const res = await api.get("/users-with-permissions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        const me = res.data.find((u) => u.email === meEmail) || {};
        setUser(me);
        setModules(me.modules || []);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-600" />
      </div>
    );
  }

  const totalPermissions = modules.reduce((sum, mod) => sum + mod.permissions.length, 0);

  return (
    <div className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
            
          
          <p className="text-sm text-gray-600 mt-1">You have access to <span className="font-semibold">{modules.length}</span> modules and <span className="font-semibold">{totalPermissions}</span> total permissions.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <div key={mod.module_name} className="bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition duration-300">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{mod.module_name}</h2>
                <p className="text-xs text-gray-500 mb-2">Permissions: {mod.permissions.length}</p>
                <div className="flex flex-wrap gap-2">
                  {mod.permissions.map((p) => (
                    <PermissionBadge key={p} permission={p} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
