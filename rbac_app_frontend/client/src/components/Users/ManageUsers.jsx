import React, { useEffect, useMemo, useState } from "react";
import api from "../../api";

const MODULE_OPTIONS = [
  { id: 24, name: "MQTT" },
  { id: 25, name: "S7" },
  { id: 26, name: "RDBMS" },
  { id: 27, name: "Reports" },
  { id: 28, name: "Devices" },
  { id: 29, name: "Users" },
];

const PERMISSION_OPTIONS = ["add", "edit", "delete", "view"];

const ManageUsers = ({ user, onClose, onSuccess }) => {
  const [originalPermissions, setOriginalPermissions] = useState({});
  const [newPermissions, setNewPermissions] = useState({});
  const [adminPermissions, setAdminPermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteChecked, setDeleteChecked] = useState(false);
  const [error, setError] = useState(null);

  const getLoggedInEmail = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchAdminPermissions = async () => {
      const email = getLoggedInEmail();
      const token = localStorage.getItem("access_token");

      try {
        const res = await api.get("/users-with-permissions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUser = res.data.find((u) => u.email === email);
        if (currentUser) {
          setAdminPermissions(currentUser.modules);
        }
      } catch (err) {
        console.error("Error fetching current admin permissions", err);
      }
    };

    fetchAdminPermissions();
  }, []);

  const currentAdminPermissionsMap = useMemo(() => {
    const map = {};
    adminPermissions.forEach((module) => {
      map[module.module_name] = module.permissions;
    });
    return map;
  }, [adminPermissions]);

  useEffect(() => {
    const original = {};
    const initialNew = {};
    user?.modules?.forEach((mod) => {
      original[mod.module_name] = [...mod.permissions];
      initialNew[mod.module_name] = [];
    });
    setOriginalPermissions(original);
    setNewPermissions(initialNew);
  }, [user]);

  const handleToggle = (moduleName, permission) => {
    setNewPermissions((prev) => {
      const current = prev[moduleName] || [];
      const updated = current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission];
      return { ...prev, [moduleName]: updated };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      for (const mod of MODULE_OPTIONS) {
        const selected = newPermissions[mod.name] || [];
        if (selected.length > 0) {
          await api.put(
            `/users/${user.id}/permissions`,
            {
              module_id: mod.id,
              permissions: selected,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Save failed", err);
      const msg = err?.response?.data?.detail || "Failed to save permissions. Try again.";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteChecked) return;
    setIsDeleting(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      await api.delete(`/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete user. Try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            Manage Permissions for <span className="text-gray-700 font-semibold">{user.email}</span>
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 text-red-800 border border-red-200 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 pb-2">
          {MODULE_OPTIONS.map((mod) => {
            const adminHasAccess = currentAdminPermissionsMap[mod.name]?.length > 0;
            if (!adminHasAccess) return null;

            const alreadyAssigned = originalPermissions[mod.name] || [];
            const selected = newPermissions[mod.name] || [];

            const assignablePermissions = PERMISSION_OPTIONS.filter(
              (perm) =>
                currentAdminPermissionsMap[mod.name]?.includes(perm) &&
                !alreadyAssigned.includes(perm)
            );

            return (
              <div key={mod.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center mb-4">
                  <h4 className="text-md font-semibold text-gray-700">{mod.name}</h4>
                  <div className="ml-3 text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded">ID: {mod.id}</div>
                </div>

                <div className="flex flex-wrap gap-3 mb-3">
                  {assignablePermissions.map((perm) => {
                    const isSelected = selected.includes(perm);
                    return (
                      <button
                        key={`${mod.id}-${perm}`}
                        onClick={() => handleToggle(mod.name, perm)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center ${
                          isSelected
                            ? "bg-gray-700 text-white border-gray-800 shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {perm}
                      </button>
                    );
                  })}
                </div>

                {alreadyAssigned.length > 0 && (
                  <div className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded inline-block">
                    Assigned: {alreadyAssigned.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <label className="flex items-center text-sm text-red-600 font-medium mb-4">
            <input
              type="checkbox"
              checked={deleteChecked}
              onChange={(e) => setDeleteChecked(e.target.checked)}
              className="mr-2 accent-red-600 h-4 w-4"
            />
            Delete this user account
          </label>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              Cancel
            </button>

            {deleteChecked && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded bg-red-100 text-red-800 hover:bg-red-200 border border-red-300 font-semibold"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded text-white ${isSaving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
