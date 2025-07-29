import { useEffect, useState } from "react";
import api from "../api";

const MODULE_OPTIONS = [
  { id: 1, name: "dashboard" },
  { id: 2, name: "users" },
  { id: 3, name: "mod1" },
  { id: 4, name: "mod2" },
  { id: 5, name: "mod3" },
  { id: 6, name: "mod4" },
  { id: 7, name: "mod5" },
  { id: 8, name: "mod6" },
];

const PERMISSION_OPTIONS = ["add", "edit", "delete", "view"];

function EditUserModal({ user, onClose, onSuccess }) {
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize from user.modules
  useEffect(() => {
    if (user.modules?.length) {
      const firstMod = user.modules[0];
      setSelectedModuleId(firstMod.module_id);
      setSelectedPermissions(firstMod.permissions || []);
      setAvailablePermissions(firstMod.permissions || []);
    } else {
      setSelectedModuleId(null);
      setSelectedPermissions([]);
      setAvailablePermissions([]);
    }
  }, [user]);

  // When module changes, update available and selected
  useEffect(() => {
    const mod = user.modules?.find(m => m.module_id === selectedModuleId);
    setAvailablePermissions(mod?.permissions || []);
    // if module had no perms, reset selection
    if (!mod?.permissions.length) setSelectedPermissions([]);
  }, [selectedModuleId, user.modules]);

  const togglePermission = (perm) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!selectedModuleId) {
      setError("Please select a module.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const payload = { module_id: selectedModuleId, permissions: selectedPermissions };
      await api.patch(`/users/${user.id}/permissions`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save user permissions", err);
      setError(err.response?.data?.detail || "Failed to save permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Edit User Permissions</h3>
          <p className="text-gray-600 mt-1">
            For: <span className="font-medium text-blue-600">{user.email}</span>
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Module</label>
            <select
              value={selectedModuleId || ""}
              onChange={e => setSelectedModuleId(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>Select a module</option>
              {MODULE_OPTIONS.map(mod => (
                <option key={mod.id} value={mod.id} className="capitalize">
                  {mod.name}
                </option>
              ))}
            </select>
          </div>

          {selectedModuleId && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Permissions</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PERMISSION_OPTIONS.map(perm => (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => togglePermission(perm)}
                    className={`flex items-center justify-center p-3 border rounded-lg transition-all
                      ${selectedPermissions.includes(perm)
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-inner'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    <span className="text-sm font-medium capitalize">{perm}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center
              ${isSaving ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;
