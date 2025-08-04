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
    <div className="pt-5 ml-3 px-4 sm:px-6 max-w-lvw mx-auto">
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
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
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
                d="M16.023 9.348h4.992M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
          </button>
          <button
            onClick={openCreateModal}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded text-sm flex items-center gap-1"
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-medium text-red-700">
            Error Loading Data
          </h3>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-md"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto  border ">
          <table className="min-w-full divide-y divide-gray-200 text-sm table-fixed border ">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 uppercase tracking-wider border ">
                  Email
                </th>
                <th className="px-6 py-3  text-center font-semibold text-gray-700 uppercase tracking-wider border ">
                  Role
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 uppercase tracking-wider border ">
                  Permissions
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 uppercase tracking-wider border ">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user) => {
                const filteredModules = (user.modules || []).filter(
                  (mod) =>
                    !(
                      mod.permissions.length === 1 &&
                      mod.permissions[0] === "view"
                    )
                );

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-1 py-4 text-center whitespace-nowrap text-gray-800 border ">
                      {user.email}
                    </td>
                    <td className="px-1 py-4 text-center border ">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-1 py-4 text-center text-gray-700 max-w-xl border">
                      <div className="flex flex-wrap gap-2">
                        {filteredModules.length > 0 ? (
                          filteredModules.map((mod, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 border  rounded text-xs text-gray-700"
                              title={`${
                                mod.module_name
                              }: ${mod.permissions.join(", ")}`}
                            >
                              <span className="font-semibold  text-gray-600 mr-1">
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
                    <td className="px-6 py-4 text-center border">
                      <button
                        onClick={() => openManageAdmin(user)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out"
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
