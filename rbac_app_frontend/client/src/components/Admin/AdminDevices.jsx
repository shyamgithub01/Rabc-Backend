import React from "react";

const AdminDevices = ({ allowedSubModules = [] }) => {
  return (
    <div className="pt-5 ml-3 px-4 sm:px-6 max-w-lvw mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Devices</h2>
        <p className="text-sm text-gray-500 mt-1">
          View accessible device modules assigned to you.
        </p>
      </div>

      {allowedSubModules.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-6 text-center shadow">
          <h3 className="text-lg font-semibold">No Access</h3>
          <p className="mt-2 text-sm">
            You currently don’t have any device-level permissions assigned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allowedSubModules.map((modName) => (
            <div
              key={modName}
              className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-md transition p-5"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {modName} Module
              </h3>
              <p className="text-sm text-gray-600">
                You have been granted access to the{" "}
                <span className="font-medium text-gray-700">{modName}</span> device module.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDevices;
