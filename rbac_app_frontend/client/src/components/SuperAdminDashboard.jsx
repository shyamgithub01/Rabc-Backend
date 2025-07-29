import { useEffect, useState } from "react";
import api from "../api";
import EditAdminModal from "./EditAdminModal";
import EditUserModal from "./EditUserModal";
import DeleteAdminModal from "./DeleteAdminModal";
import DeleteUserModal from "./DeleteUserModal";

function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await api.get("/users-with-permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
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

  const openEditModal = (user) => {
    setSelectedUser(user);
    setModalType(user.role === "admin" ? "editAdmin" : "editUser");
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setModalType(user.role === "admin" ? "deleteAdmin" : "deleteUser");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Superadmin Panel – View & Manage Users/Admins
        </h3>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search by email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button
            onClick={fetchUsers}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setSearchTerm("")}
            className="px-3 py-1 text-xs bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            All Users ({users.length})
          </button>
          <button 
            onClick={() => setSearchTerm("admin")}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
          >
            Admins ({users.filter(u => u.role === "admin").length})
          </button>
          <button 
            onClick={() => setSearchTerm("user")}
            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
          >
            Users ({users.filter(u => u.role === "user").length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <svg 
            className="animate-spin h-10 w-10 text-blue-600" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={fetchUsers}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile View - Card Layout */}
          <div className="sm:hidden space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{user.email}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        user.role === "admin" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Permissions:</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {user.modules?.length ? (
                        user.modules.map((mod, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {mod.module_name}: {mod.permissions.join(", ")}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No permissions</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-gray-500">No users found</p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden sm:block overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user.modules?.length ? (
                            <div className="flex flex-wrap gap-1">
                              {user.modules.map((mod, idx) => (
                                <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {mod.module_name}: {mod.permissions.join(", ")}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">No permissions</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2">No users found</p>
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm("")}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modals */}
      {modalType === "editAdmin" && selectedUser && (
        <EditAdminModal
          admin={selectedUser}
          onClose={closeModal}
          onSuccess={fetchUsers}
        />
      )}

      {modalType === "editUser" && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={closeModal}
          onSuccess={fetchUsers}
        />
      )}

      {modalType === "deleteAdmin" && selectedUser && (
        <DeleteAdminModal
          admin={selectedUser}
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
    </div>
  );
}

export default SuperAdminDashboard;