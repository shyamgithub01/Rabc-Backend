import { useEffect, useState, useMemo } from "react";
import api from "../../api";

const PERMISSION_OPTIONS = ["add", "edit", "delete", "view"];

function EditAdminModal({ admin, onClose, onSuccess }) {
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Get modules assigned to this admin
  const adminAssignedModules = useMemo(() => {
    return admin.modules || [];
  }, [admin.modules]);

  // Selected module details
  const selectedModule = useMemo(() => {
    return adminAssignedModules.find(mod => mod.module_id === selectedModuleId);
  }, [adminAssignedModules, selectedModuleId]);

  // Set default module & permissions when admin changes
  useEffect(() => {
    if (adminAssignedModules.length > 0) {
      const firstModule = adminAssignedModules[0];
      setSelectedModuleId(firstModule.module_id);
      setSelectedPermissions(firstModule.permissions);
    } else {
      setSelectedModuleId(null);
      setSelectedPermissions([]);
    }
  }, [adminAssignedModules]);

  const togglePermission = (perm) => {
    if (!selectedModule?.permissions.includes(perm)) return; // Only allow toggle if admin has it

    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!selectedModuleId) {
      alert("Please select a module.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const token = localStorage.getItem("access_token");
    const payload = {
      module_id: selectedModuleId,
      permissions: selectedPermissions,
    };

    try {
      await api.put(`/admins/${admin.id}/permissions`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save permissions", error);
      let errorMessage = "Failed to save permissions";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Edit Permissions</h3>
          <p className="text-gray-600 mt-1">
            For admin: <span className="font-medium text-green-600">{admin.email}</span>
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {adminAssignedModules.length === 0 && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-blue-700">No modules assigned by superadmin.</p>
            </div>
          )}

          {adminAssignedModules.length > 0 && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Module
              </label>
              <select
                value={selectedModuleId || ""}
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  setSelectedModuleId(id);
                  const module = adminAssignedModules.find(mod => mod.module_id === id);
                  setSelectedPermissions(module?.permissions || []);
                }}
                className="w-full px-4 py-3 mb-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {adminAssignedModules.map((module) => (
                  <option key={module.module_id} value={module.module_id}>
                    {module.module_name || `Module ${module.module_id}`}
                  </option>
                ))}
              </select>

              {selectedModule && (
                <>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Select Permissions
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PERMISSION_OPTIONS.map((perm) => {
                      if (!selectedModule.permissions.includes(perm)) return null;
                      return (
                        <button
                          key={perm}
                          onClick={() => togglePermission(perm)}
                          className={`
                            p-3 border rounded-lg transition-all
                            ${selectedPermissions.includes(perm)
                              ? "bg-green-50 border-green-500 text-green-700 shadow-inner"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}
                          `}
                        >
                          <span className="capitalize">{perm}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditAdminModal;
