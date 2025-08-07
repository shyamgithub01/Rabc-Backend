import { useEffect, useState } from "react";
import api from "../../api";
import ManageAdmins from "../SuperAdmin/ManageAdmins";
import AdminCreate from "../Admin/AdminCreate";
import { motion, AnimatePresence } from "framer-motion";

// Color constants
const MIDNIGHT_BLUE = "#41729f";
const BLUE_GRAY = "#5885af";
const DARK_BLUE = "#274472";
const BABY_BLUE = "#c3e0e5";

function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await api.get("/users-with-permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Sort admins by ID descending (newest first)
      const onlyAdmins = res.data
        .filter((user) => user.role === "admin")
        .sort((a, b) => b.id - a.id);

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
    setSelectedUser(null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // New function to handle admin creation success
  const handleAdminCreated = () => {
    setCurrentPage(1); // Reset to first page
    fetchUsers(); // Refresh the list
  };

  return (
    <div className="w-full pt-5 relative">
      {/* Premium Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4 px-3 sm:px-6">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: DARK_BLUE }}
          >
            Admin Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage admin accounts with permissions
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchUsers}
            title="Refresh"
            className="p-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:rotate-180"
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
            className="text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 w-full justify-center sm:w-auto transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            style={{
              background: `linear-gradient(90deg, ${MIDNIGHT_BLUE} 0%, ${BLUE_GRAY} 100%)`,
            }}
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

      {/* Stats Cards with Premium Design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2 px-4 sm:px-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white p-5 rounded-xl  border border-gray-100 shadow-sm hover:shadow-md transition-all"
          style={{ borderColor: BABY_BLUE }}
        >
          <div className="flex items-center">
            <div className="flex items-center">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${MIDNIGHT_BLUE}10` }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={MIDNIGHT_BLUE}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">
                  {users.length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white p-5 rounded-xl border border极-100 shadow-sm hover:shadow-md transition-all"
          style={{ borderColor: BABY_BLUE }}
        >
          <div className="flex items-center">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${BLUE_GRAY}10` }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke={BLUE_GRAY}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Admins</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter((u) => u.status === "active").length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
          style={{ borderColor: BABY_BLUE }}
        >
          <div className="flex items-center">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${DARK_BLUE}10` }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke={DARK_BLUE}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Permissions Granted</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.reduce(
                  (acc, user) =>
                    acc +
                    (user.modules?.reduce(
                      (modAcc, mod) => modAcc + mod.permissions.length,
                      0
                    ) || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Loading Spinner */}
      {isLoading ? (
        <div
          className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border mx-4 sm:mx-6"
          style={{ borderColor: BABY_BLUE }}
        >
          <div className="flex flex-col items-center">
            <div
              className="w-14 h-14 rounded-full border-4 border-t-[#274472] border-b-[#41729f]/20 animate-spin mb-4"
              style={{
                borderTopColor: DARK_BLUE,
                borderBottomColor: `${MIDNIGHT_BLUE}20`,
              }}
            ></div>
            <p className="text-gray-600 font-medium">Loading admin data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-sm mx-4 sm:mx-6">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-600">Error Loading Data</h3>
          <p className="text-red-700 mt-2 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 text-white py-2 px-5 rounded-lg font-medium transition-all hover:shadow-md"
            style={{
              background: `linear-gradient(90deg, ${MIDNIGHT_BLUE} 0%, ${BLUE_GRAY} 100%)`,
            }}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div
          className="bg-white h-[72vh] rounded-2xl shadow-sm border overflow-hidden mx-4 sm:mx-6"
          style={{ borderColor: BABY_BLUE }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 sm:mb-0">
              Admin Accounts
            </h3>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 w-full shadow-sm transition-all"
                style={{
                  borderColor: BABY_BLUE,
                  focusBorderColor: MIDNIGHT_BLUE,
                  focusRingColor: `${MIDNIGHT_BLUE}20`,
                }}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto ">
            <table
              className="min-w-full divide-y text-sm"
              style={{ divideColor: "rgba(195,224,229,0.5)" }}
            >
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-500 text-left text-xs uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-left text-xs uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-left text-xs uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className="bg-white divide-y"
                style={{ divideColor: "rgba(195,224,229,0.5)" }}
              >
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                          style={{ background: "rgba(195,224,229,0.3)" }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="#41729f"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-base font-medium text-gray-600">
                          No admins found
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                          Create your first admin to get started
                        </p>
                        <button
                          onClick={openCreateModal}
                          className="mt-4 text-white py-2 px-5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(65,114,159,0.8) 0%, rgba(88,133,175,0.8) 100%)",
                          }}
                        >
                          Create Admin
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => {
                    const filteredModules = (user.modules || []).filter(
                      (mod) =>
                        !(
                          mod.permissions.length === 1 &&
                          mod.permissions[0] === "view"
                        )
                    );

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-all duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ background: "rgba(65,114,159,0.05)" }}
                            >
                              <span
                                className="text-sm font-medium"
                                style={{ color: "#274472" }}
                              >
                                {user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="font-medium text-gray-800 text-sm">
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-500">
                                {user.name || "No name provided"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                            style={{
                              background: "rgba(65,114,159,0.1)",
                              color: "#41729f",
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {filteredModules.length > 0 ? (
                              filteredModules.map((mod, idx) => (
                                <div key={idx} className="relative group">
                                  <span
                                    className="text-xs px-2 py-0.5 rounded cursor-default font-medium"
                                    style={{
                                      background: "rgba(39,68,114,0.05)",
                                      color: "rgba(39,68,114,0.8)",
                                    }}
                                  >
                                    {mod.module_name} ({mod.permissions.length})
                                  </span>
                                  <div
                                    className="absolute hidden group-hover:block z-10 bottom-full left-0 mb-2 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-sm"
                                    style={{
                                      backgroundColor: "rgba(65,114,159,0.9)",
                                    }}
                                  >
                                    {mod.permissions.join(", ")}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs italic">
                                No permissions
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => openManageAdmin(user)}
                            className="font-medium px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 border"
                            style={{
                              background: "rgba(65,114,159,0.05)",
                              borderColor: "rgba(65,114,159,0.2)",
                              color: "#41729f",
                            }}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredUsers.length > 0 && (
            <div className="px-2 py-2 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-bold">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-bold">
                  {Math.min(indexOfLastItem, filteredUsers.length)}
                </span>{" "}
                of <span className="font-bold">{filteredUsers.length}</span>{" "}
                results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed border-gray-200"
                      : "text-gray-700 hover:bg-gray-50 hover:shadow-sm border-gray-300"
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? "text-white shadow-md"
                          : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                      style={
                        currentPage === page
                          ? {
                              background: `linear-gradient(90deg, ${MIDNIGHT_BLUE} 0%, ${BLUE_GRAY} 100%)`,
                            }
                          : {}
                      }
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed border-gray-200"
                      : "text-gray-700 hover:bg-gray-50 hover:shadow-sm border-gray-300"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Professional Modal System */}
      <AnimatePresence>
        {/* Create Admin Modal */}
        {modalType === "createAdmin" && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-4 right-0 z-50 shadow-2xl"
            style={{ height: "auto", maxHeight: "calc(100vh - 2rem)" }}
          >
            <div
              className="bg-white rounded-l-2xl h-full overflow-y-auto"
              style={{
                borderColor: BABY_BLUE,
                borderLeftWidth: "1px",
                borderTopWidth: "1px",
                borderBottomWidth: "1px",
                boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
              }}
            >
              <div
                className="sticky top-0 z-10 p-5 flex justify-between items-center border-b"
                style={{
                  background: `linear-gradient(90deg, ${MIDNIGHT_BLUE} 0%, ${BLUE_GRAY} 100%)`,
                  borderColor: BABY_BLUE,
                }}
              >
                <h3 className="text-xl font-bold text-white">
                  Create New Admin
                </h3>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 text-xl transition-all hover:rotate-90"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <AdminCreate
                  onClose={closeModal}
                  onSuccess={handleAdminCreated}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Manage Admin Modal */}
        {modalType === "manageAdmin" && selectedUser && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-4 right-0 z-50 shadow-2xl"
            style={{ height: "auto", maxHeight: "calc(100vh - 2rem)" }}
          >
            <div
              className="bg-white rounded-l-2xl h-full overflow-y-auto"
              style={{
                borderColor: BABY_BLUE,
                borderLeftWidth: "1px",
                borderTopWidth: "1px",
                borderBottomWidth: "1px",
                boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
              }}
            >
              <ManageAdmins
                admin={selectedUser}
                onClose={closeModal}
                onSuccess={fetchUsers}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SuperAdminDashboard;
