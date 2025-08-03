import { useEffect, useState } from "react";
import api from "../../api";
import EditUserModal from "../Users/EditUserModal";
import DeleteUserModal from "../Users/DeleteUserModal";
import UserCreate from "../Users/UserCreate";
import decodeToken from "../../utils/decodeToken";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const decoded = decodeToken(token);
      const adminEmail = decoded?.sub;

      const res = await api.get("/users-with-permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allUsers = res.data;
      const currentAdmin = allUsers.find((u) => u.email === adminEmail);

      if (!currentAdmin) {
        setError("Logged-in admin not found in user list.");
        setUsers([]);
        return;
      }

      setAdminId(currentAdmin.id);
      setUsers(allUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load user data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setModalType("editUser");
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setModalType("deleteUser");
  };

  const openCreateModal = () => {
    setModalType("createUser");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
  };

  const filteredUsers = users
    .filter((u) => u.role === "user" && u.created_by === adminId)
    .filter((u) => u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-7">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Users</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add, edit and manage user accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            title="Refresh list"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
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
            className="flex items-center gap-1.5 bg-gray-700 text-white text-sm font-medium pl-3 pr-4 py-2.5 rounded-lg shadow hover:shadow-md transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create User
          </button>
        </div>
      </div>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {isLoading ? (
        <p className="text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-red-500 font-medium">{error}</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow border">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Permissions</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{user.email}</td>
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
                              !(mod.permissions.length === 1 && mod.permissions[0] === "view")
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
                      <span className="text-gray-400 italic">No permissions</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalType === "editUser" && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={closeModal}
          onSuccess={fetchUsers}
        />
      )}

      {modalType === "deleteUser" && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={closeModal}
          onSuccess={fetchUsers}
        />
      )}

      {modalType === "createUser" && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg relative p-6">
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-600 hover:text-black text-xl"
            >
              &times;
            </button>
            <UserCreate
              onSuccess={() => {
                closeModal();
                fetchUsers();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
