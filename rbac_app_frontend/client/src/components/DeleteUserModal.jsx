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

function DeleteUserModal({ user, onClose, onSuccess }) {
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user.modules?.length > 0) {
      const mod = user.modules[0];
      setSelectedModuleId(mod.module_id);
      
      // Get permissions for the initially selected module
      const module = user.modules.find(m => m.module_id === mod.module_id);
      setAvailablePermissions(module?.permissions || []);
    }
  }, [user]);

  useEffect(() => {
    if (selectedModuleId) {
      // Find the permissions for the selected module
      const module = user.modules?.find(mod => mod.module_id === selectedModuleId);
      setAvailablePermissions(module?.permissions || []);
      // Reset selected permissions when module changes
      setSelectedPermissions([]);
    }
  }, [selectedModuleId, user.modules]);

  const togglePermission = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleDelete = async () => {
    if (!selectedModuleId || selectedPermissions.length === 0) {
      alert("Please select a module and at least one permission to delete.");
      return;
    }

    setIsDeleting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("access_token");
      await api.delete(`/users/${user.id}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          module_id: selectedModuleId,
          permissions: selectedPermissions
        }
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to delete user permissions", error);
      
      // Improved error handling
      let errorMessage = "Could not delete permissions";
      if (error.response) {
        if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.status === 422) {
          errorMessage = "Invalid data format. Please try again.";
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get the module name for the selected module
  const selectedModuleName = MODULE_OPTIONS.find(
    mod => mod.id === selectedModuleId
  )?.name || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            PERMISSIONS
          </h3>
          <p className="text-gray-600 mt-1">
            For user: <span className="font-medium text-blue-600">{user.email}</span>
          </p>
        </div>
        
        <div className="p-6">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* Module display */}
          {selectedModuleId && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2 capitalize">
                {selectedModuleName}
              </h4>
              <div className="flex flex-wrap gap-2">
                {availablePermissions.map((perm) => (
                  <span 
                    key={perm} 
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Module selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Module
            </label>
            <div className="relative">
              <select
                value={selectedModuleId || ""}
                onChange={(e) => setSelectedModuleId(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="" disabled>Select a module</option>
                {MODULE_OPTIONS.map((module) => (
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

          {selectedModuleId && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Select Permissions to Delete
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PERMISSION_OPTIONS.map((perm) => (
                  <button
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border transition-all
                      ${selectedPermissions.includes(perm)
                        ? "bg-red-50 border-red-500 text-red-700 shadow-inner"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}
                      hover:shadow-sm
                    `}
                  >
                    <span className="text-sm font-medium capitalize">{perm}</span>
                    {selectedPermissions.includes(perm) && (
                      <div className="mt-1 w-4 h-4 flex items-center justify-center bg-red-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || selectedPermissions.length === 0}
            className={`px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center ${
              isDeleting || selectedPermissions.length === 0 ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              "Delete Selected"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteUserModal;