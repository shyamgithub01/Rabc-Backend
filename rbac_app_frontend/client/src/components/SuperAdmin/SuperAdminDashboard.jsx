import { useEffect, useState } from "react";
import api from "../../api";
import ManageAdmins from "../SuperAdmin/ManageAdmins";
import AdminCreate from "../Admin/AdminCreate";

function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await api.get("/users-with-permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const onlyAdmins = res.data.filter((user) => user.role === "admin");
      setUsers(onlyAdmins);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load user data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openManageAdmin = (user) => {
    setSelectedUser(user);
    setModalType("manageAdmin");
  };

  const openCreateModal = () => {
    setModalType("createAdmin");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
  };

  return (
    <div className="pt-5 ml-3 px-4 sm:px-6 max-w-lvw mx-auto">
      {/* Header Section */}
<div className="flex justify-between items-center mb-8">
  <div>
    <h2 className="text-3xl font-extrabold text-gray-800">Manage Admins</h2>
    <p className="text-sm text-gray-500 mt-1">
      Create and manage admin accounts with ease.
    </p>
  </div>
  <div className="flex items-center gap-3">
    <button
      onClick={fetchUsers}
      title="Refresh"
      className="p-2 text-blue-600 bg-white border border-blue-200 hover:bg-blue-100 rounded-full shadow transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582m15.333-2.707A9 9 0 016.582 18.418M4 20v-5h.582"
        />
      </svg>
    </button>
    <button
      onClick={openCreateModal}
      className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 shadow hover:scale-105 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          clipRule="evenodd"
        />
      </svg>
      Create Admin
    </button>
  </div>
</div>

{/* Loading Spinner */}
{isLoading ? (
  <div className="flex justify-center items-center h-64">
    <div className="w-14 h-14 rounded-full border-4 border-t-blue-600 border-b-blue-300 animate-spin"></div>
  </div>
) : error ? (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center shadow">
    <h3 className="text-xl font-semibold text-red-700">Error Loading Data</h3>
    <p className="text-red-600 mt-2">{error}</p>
    <button
      onClick={fetchUsers}
      className="mt-4 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-md"
    >
      Try Again
    </button>
  </div>
) : (
  <div className="overflow-x-auto border rounded-xl shadow-lg bg-white">
    <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
      <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider">
        <tr>
          <th className="px-6 py-4 font-semibold">Email</th>
          <th className="px-6 py-4 font-semibold">Role</th>
          <th className="px-6 py-4 font-semibold">Permissions</th>
          <th className="px-6 py-4 text-center font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {users.map((user) => {
          const filteredModules = (user.modules || []).filter(
            (mod) =>
              !(mod.permissions.length === 1 && mod.permissions[0] === "view")
          );

          return (
            <tr key={user.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="bg-blue-100 text-blue-800 px-3 py-0.5 rounded-full text-xs font-semibold shadow-sm capitalize">
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 max-w-xl">
                <div className="flex flex-wrap gap-2">
                  {filteredModules.length > 0 ? (
                    filteredModules.map((mod, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 bg-slate-100 border rounded-full text-xs text-gray-700 shadow-sm hover:scale-[1.03] transition cursor-default"
                        title={`${mod.module_name}: ${mod.permissions.join(", ")}`}
                      >
                        <span className="font-semibold text-gray-600 mr-1">
                          {mod.module_name}:
                        </span>
                        {mod.permissions.join(", ")}
                      </span>
                    ))
                  ) : (
                    <span className="italic text-gray-400">
                      No meaningful permissions
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => openManageAdmin(user)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150 ease-in-out"
                >
                  Manage
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}


      
      {/* Manage Admin Side Panel (No black bg) */}
      {modalType === "manageAdmin" && selectedUser && (
        <div className="fixed top-20  bottom-4 right-4 w-full max-w-md z-50">
          <div className="bg-white rounded-xl  shadow-xl border p-6 h-fit overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Manage Permissions for{" "}
                <span className="font-normal">{selectedUser.email}</span>
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>
            <ManageAdmins
              admin={selectedUser}
              onClose={closeModal}
              onSuccess={fetchUsers}
            />
          </div>
        </div>
      )}

      {/* Create Admin Side Panel */}
      {modalType === "createAdmin" && (
        <div className="fixed inset-0  z-50">
          <div className="fixed top-20 right-4 bottom-2 h-fit w-full max-w-md bg-white rounded-xl shadow-xl border p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Create Admin
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>
            <AdminCreate onClose={closeModal} onSuccess={fetchUsers} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;
