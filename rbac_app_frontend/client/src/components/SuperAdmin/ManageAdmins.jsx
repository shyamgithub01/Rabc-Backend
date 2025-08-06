import React, { useEffect, useState } from "react";
import api from "../../api";
import { motion } from "framer-motion";

// Color constants from dashboard theme
const MIDNIGHT_BLUE = "#41729f";
const BLUE_GRAY = "#5885af";
const DARK_BLUE = "#274472";
const BABY_BLUE = "#c3e0e5";

const MODULE_OPTIONS = [
  { id: 24, name: "MQTT" },
  { id: 25, name: "S7" },
  { id: 26, name: "RDBMS" },
  { id: 27, name: "Reports" },
  { id: 28, name: "Devices" },
  { id: 29, name: "Users" },
  { id: 30, name: "Dashboard" },
];

const PERMISSION_OPTIONS = ["add", "edit", "delete", "view"];

const ManageAdmins = ({ admin, onClose, onSuccess }) => {
  const [assignedPermissions, setAssignedPermissions] = useState({});
  const [originalPermissions, setOriginalPermissions] = useState({});
  const [newPermissions, setNewPermissions] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteAdmin, setDeleteAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    const original = {};
    const initialNew = {};
    admin?.modules?.forEach((mod) => {
      original[mod.module_name] = [...mod.permissions];
      initialNew[mod.module_name] = [];
    });
    setOriginalPermissions(original);
    setNewPermissions(initialNew);
    
    // Set first module as active by default
    if (MODULE_OPTIONS.length > 0) {
      setActiveModule(MODULE_OPTIONS[0].name);
    }
  }, [admin]);

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
            `/admins/${admin.id}/permissions`,
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
      setError("Failed to save permissions. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");

      if (deleteAdmin) {
        await api.delete(`/admins/${admin.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete admin. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      style={{ borderColor: BABY_BLUE, borderWidth: "1px" }}
    >
      {/* Header with blue gradient */}
      <div 
        className="sticky top-0 z-10 p-5 flex justify-between items-center border-b"
        style={{ 
          background: `linear-gradient(90deg, ${MIDNIGHT_BLUE} 0%, ${BLUE_GRAY} 100%)`,
          borderColor: BABY_BLUE
        }}
      >
        <div>
          <h3 className="text-xl font-bold text-white">
            Manage Admin Permissions
          </h3>
          <p className="text-sm text-white/80 mt-1 flex items-center">
            <span className="font-medium">{admin.email}</span>
            <span className="mx-2">•</span>
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-medium capitalize">
              {admin.role}
            </span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-xl transition-all hover:rotate-90"
        >
          &times;
        </button>
      </div>

      {/* Content */}
      <div 
        className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto"
        style={{ maxHeight: "70vh" }}
      >
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 mt-0.5 text-red-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Module Navigation */}
          <div className="lg:w-1/4">
            <div 
              className="rounded-xl p-4 border"
              style={{ backgroundColor: `${BABY_BLUE}20`, borderColor: BABY_BLUE }}
            >
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                Modules
              </h4>
              <ul className="space-y-1">
                {MODULE_OPTIONS.map((mod) => {
                  const assigned = originalPermissions[mod.name] || [];
                  return (
                    <li key={mod.id}>
                      <button
                        onClick={() => setActiveModule(mod.name)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between ${
                          activeModule === mod.name
                            ? "bg-white text-gray-800 font-medium shadow-sm"
                            : "hover:bg-white/50"
                        }`}
                        style={{ borderColor: BABY_BLUE, borderWidth: "1px" }}
                      >
                        <span>{mod.name}</span>
                        {assigned.length > 0 && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: `${DARK_BLUE}20`,
                              color: DARK_BLUE
                            }}
                          >
                            {assigned.length}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Permissions Panel */}
          <div className="lg:w-3/4">
            <div 
              className="rounded-xl p-5 border"
              style={{ backgroundColor: `${BABY_BLUE}20`, borderColor: BABY_BLUE }}
            >
              {MODULE_OPTIONS.filter((mod) => mod.name === activeModule).map(
                (mod) => {
                  const alreadyAssigned = originalPermissions[mod.name] || [];
                  const selected = newPermissions[mod.name] || [];
                  const remainingPerms = PERMISSION_OPTIONS.filter(
                    (perm) => !alreadyAssigned.includes(perm)
                  );

                  return (
                    <div key={mod.id}>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center">
                          <span>{mod.name}</span>
                          <span 
                            className="ml-3 text-xs px-2 py-1 rounded"
                            style={{ 
                              backgroundColor: `${DARK_BLUE}10`,
                              color: DARK_BLUE
                            }}
                          >
                            ID: {mod.id}
                          </span>
                        </h4>
                        <div className="text-sm font-medium text-gray-600">
                          Permissions
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {remainingPerms.map((perm) => {
                          const isSelected = selected.includes(perm);
                          return (
                            <motion.button
                              key={perm}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleToggle(mod.name, perm)}
                              className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all flex items-center justify-center ${
                                isSelected
                                  ? "text-white shadow-md"
                                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                              }`}
                              style={isSelected ? { 
                                background: `linear-gradient(90deg, ${MIDNIGHT_BLUE} 0%, ${BLUE_GRAY} 100%)`,
                                borderColor: MIDNIGHT_BLUE
                              } : {}}
                            >
                              {isSelected ? (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1.5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {perm}
                                </>
                              ) : (
                                perm
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      <div className="mt-6 pt-5 border-t" style={{ borderColor: BABY_BLUE }}>
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">
                          Currently Assigned Permissions
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {alreadyAssigned.length > 0 ? (
                            alreadyAssigned.map((perm) => (
                              <span
                                key={perm}
                                className="px-3 py-1.5 rounded-full text-sm font-medium"
                                style={{ 
                                  backgroundColor: `${DARK_BLUE}20`,
                                  color: DARK_BLUE
                                }}
                              >
                                {perm}
                              </span>
                            ))
                          ) : (
                            <div 
                              className="rounded-lg px-4 py-3 text-sm flex items-center"
                              style={{ 
                                backgroundColor: `${BABY_BLUE}30`,
                                borderColor: BABY_BLUE,
                                borderWidth: "1px",
                                color: DARK_BLUE
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              No permissions assigned to this module
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div 
              className="mt-6 rounded-xl p-5"
              style={{ backgroundColor: `${BABY_BLUE}20`, borderColor: BABY_BLUE, borderWidth: "1px" }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-600 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    Admin Account Deletion
                  </h4>
                  <div className="mt-2 flex items-center">
                    <input
                      id="delete-admin"
                      type="checkbox"
                      checked={deleteAdmin}
                      onChange={(e) => setDeleteAdmin(e.target.checked)}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label
                      htmlFor="delete-admin"
                      className="ml-2 text-sm text-red-700"
                    >
                      I understand this will permanently delete the admin account for{" "}
                      <span className="font-semibold">{admin.email}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div 
        className="mt-8 pt-6 border-t flex justify-between items-center p-5"
        style={{ borderColor: BABY_BLUE, backgroundColor: `${BABY_BLUE}10` }}
      >
        <button
          onClick={handleDelete}
          disabled={isDeleting || !deleteAdmin}
          className={`px-5 py-2.5 text-white rounded-lg flex items-center transition-all min-w-[120px] justify-center ${
            deleteAdmin
              ? "bg-red-600 hover:bg-red-700"
              : "bg-red-300 cursor-not-allowed"
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
            "Delete Admin"
          )}
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors min-w-[100px]"
            style={{ borderColor: BABY_BLUE }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 text-white rounded-lg transition-all shadow-md hover:shadow-lg min-w-[160px]"
            style={{ background: `linear-gradient(90deg, ${MIDNIGHT_BLUE} 0%, ${BLUE_GRAY} 100%)` }}
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
              "Save Permissions"
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ManageAdmins;