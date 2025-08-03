import React, { useEffect, useState } from "react";
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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteUser, setDeleteUser] = useState(false);
  const [error, setError] = useState(null);

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
      setError("Failed to save permissions. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");

      if (deleteUser) {
        await api.delete(`/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

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
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-7 max-h-[50vh] overflow-y-auto pr-2 pb-2">
          {MODULE_OPTIONS.map((mod) => {
            const alreadyAssigned = originalPermissions[mod.name] || [];
            const selected = newPermissions[mod.name] || [];

            const remainingPerms = PERMISSION_OPTIONS.filter(
              (perm) => !alreadyAssigned.includes(perm)
            );

            return (
              <div key={mod.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center mb-4">
                  <h4 className="text-md font-semibold text-gray-700">
                    {mod.name}
                  </h4>
                  <div className="ml-3 text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    ID: {mod.id}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-3">
                  {remainingPerms.map((perm) => {
                    const isSelected = selected.includes(perm);
                    return (
                      <button
                        key={perm}
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

                <div className="ml-1 text-sm flex items-center">
                  {alreadyAssigned.length > 0 ? (
                    <span className="text-green-700 bg-green-50 px-3 py-1 rounded-lg inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Assigned: {alreadyAssigned.join(", ")}
                    </span>
                  ) : (
                    <span className="text-yellow-700 bg-yellow-50 px-3 py-1 rounded-lg inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      No permissions assigned
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-7 pt-5 border-t border-gray-200">
          <div className="flex items-center mb-6">
            <input
              id="delete-user"
              type="checkbox"
              checked={deleteUser}
              onChange={(e) => setDeleteUser(e.target.checked)}
              className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="delete-user" className="ml-2 text-sm text-red-700 font-medium">
              Delete this user account
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting || !deleteUser}
              className={`px-5 py-2.5 text-white rounded-lg flex items-center ${
                deleteUser 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-red-300 cursor-not-allowed"
              } transition-colors`}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
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
