import { useEffect, useState, useMemo } from "react";
import api from "../../api";

const MODULE_OPTIONS = [
  { id: 9, name: "MQTT" },
  { id: 10, name: "S7" },
  { id: 11, name: "RDBMS" },
];

const PERMISSION_OPTIONS = ["add", "edit", "delete", "view"];

function EditUserModal({ user, onClose, onSuccess }) {
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const modulesWithMissingPermissions = useMemo(() => {
    return MODULE_OPTIONS.filter(module => {
      const userModule = user.modules?.find(m => m.module_id === module.id);
      return !userModule || PERMISSION_OPTIONS.some(perm =>
        !userModule.permissions.includes(perm)
      );
    });
  }, [user.modules]);

  const missingPermissions = useMemo(() => {
    if (!selectedModuleId) return [];

    const userModule = user.modules?.find((m) => m.module_id === selectedModuleId);
    const currentPermissions = userModule?.permissions || [];

    return PERMISSION_OPTIONS.filter(p => !currentPermissions.includes(p));
  }, [selectedModuleId, user.modules]);

  useEffect(() => {
    if (modulesWithMissingPermissions.length > 0) {
      setSelectedModuleId(modulesWithMissingPermissions[0].id);
    } else {
      setSelectedModuleId(null);
    }
    setSelectedPermissions([]);
  }, [user.modules, modulesWithMissingPermissions]);

  const togglePermission = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!selectedModuleId || selectedPermissions.length === 0) {
      alert("Please select a module and at least one permission to add.");
      return;
    }

    setIsSaving(true);
    setError(null);

    // Get previously assigned permissions
    const assignedModule = user.modules?.find((m) => m.module_id === selectedModuleId);
    const existingPermissions = assignedModule?.permissions || [];

    // Merge with newly selected permissions
    const finalPermissions = Array.from(
      new Set([...existingPermissions, ...selectedPermissions])
    );

    const token = localStorage.getItem("access_token");
    const payload = {
      module_id: selectedModuleId,
      permissions: finalPermissions,
    };

    try {
      await api.put(`/users/${user.id}/permissions`, payload, {
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
          <h3 className="text-xl font-bold text-gray-800">Add Permissions</h3>
          <p className="text-gray-600 mt-1">
            For user: <span className="font-medium text-green-600">{user.email}</span>
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {modulesWithMissingPermissions.length === 0 && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-700">
                This user already has all permissions assigned for every module.
              </p>
            </div>
          )}

          {modulesWithMissingPermissions.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Module</label>
              <div className="relative">
                <select
                  value={selectedModuleId || ""}
                  onChange={(e) => setSelectedModuleId(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                >
                  <option value="" disabled>Select a module</option>
                  {modulesWithMissingPermissions.map((module) => (
                    <option key={module.id} value={module.id} className="capitalize">
                      {module.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {selectedModuleId && missingPermissions.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Select Permissions to Add
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {missingPermissions.map((perm) => (
                  <button
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all
                      ${selectedPermissions.includes(perm)
                        ? "bg-green-50 border-green-500 text-green-700 shadow-inner"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"} hover:shadow-sm`}
                  >
                    <span className="text-sm font-medium capitalize">{perm}</span>
                    {selectedPermissions.includes(perm) && (
                      <div className="mt-1 w-4 h-4 flex items-center justify-center bg-green-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedModuleId && missingPermissions.length === 0 && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-700 text-center">
                All permissions already assigned for this module
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || selectedPermissions.length === 0}
            className={`px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center ${
              isSaving || selectedPermissions.length === 0 ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Add Permissions"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;
