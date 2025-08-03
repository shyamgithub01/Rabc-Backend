import { useEffect, useState } from "react";
import api from "../../api";
import ManageAdmins from "../Admin/ManageAdmins";
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
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Admins</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage admin accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            title="Refresh"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
          <button
            onClick={openCreateModal}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm flex items-center transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-medium text-red-700 mt-4">Error Loading Data</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-md"
          >
            Try Again
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mt-4">No admins found</h3>
          <p className="text-gray-500 mt-2">
            You haven't created any admins yet. Click "Create Admin" to add your first admin account.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-md inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create First Admin
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow border">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Permissions
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                  Manage
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.modules && user.modules.length > 0 ? (
                      <div className="space-y-1">
                        {user.modules
                          .filter(
                            (mod) =>
                              !(
                                mod.permissions.length === 1 &&
                                mod.permissions[0] === "view"
                              )
                          )
                          .map((mod, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-gray-100 px-2 py-1 rounded inline-block mr-1 mb-1"
                            >
                              {mod.module_name}: {mod.permissions.join(", ")}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">
                        No permissions
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openManageAdmin(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalType === "manageAdmin" && selectedUser && (
        <ManageAdmins
          admin={selectedUser}
          onClose={closeModal}
          onSuccess={fetchUsers}
        />
      )}

      {modalType === "createAdmin" && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg relative p-6">
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-600 hover:text-black text-xl"
            >
              &times;
            </button>
            <AdminCreate onClose={closeModal} onSuccess={fetchUsers} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;