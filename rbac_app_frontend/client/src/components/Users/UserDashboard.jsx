import React, { useState, useEffect } from "react";
import api from "../../api";

const PermissionBadge = ({ permission }) => {
  const colorMap = {
    view: "bg-blue-100 text-blue-800 border-blue-200",
    edit: "bg-yellow-100 text-yellow-800 border-yellow-200",
    add: "bg-green-100 text-green-800 border-green-200",
    delete: "bg-red-100 text-red-800 border-red-200",
    
  };
  return (
    <span className={`inline-block px-3 py-1 text-xs font-medium border rounded-full ${colorMap[permission] || "bg-gray-100 text-gray-700 border-gray-200"}`}>{permission}</span>
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
    <div className="pt-5 ml-3 px-4 sm:px-6 max-w-lvw mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Your Access</h2>
        <p className="text-sm text-gray-500 mt-1">
          You have access to <span className="font-semibold">{modules.length}</span> modules and <span className="font-semibold">{totalPermissions}</span> permissions.
        </p>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm table-fixed border">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-center font-semibold text-gray-700 uppercase tracking-wider border">
                Module
              </th>
              <th className="px-6 py-3 text-center font-semibold text-gray-700 uppercase tracking-wider border">
                Permissions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {modules.map((mod) => (
              <tr key={mod.module_name} className="hover:bg-gray-50">
                <td className="px-1 py-4 text-center border text-gray-800 font-medium">
                  {mod.module_name}
                </td>
                <td className="px-1 py-4 text-center border">
                  <div className="flex flex-wrap justify-center gap-2">
                    {mod.permissions.map((p) => (
                      <PermissionBadge key={p} permission={p} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
