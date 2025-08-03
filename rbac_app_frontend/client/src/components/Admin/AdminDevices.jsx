import React from "react";

const AdminDevices = ({ allowedSubModules = [] }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Devices</h2>
      <div className="space-y-4">
        {allowedSubModules.length === 0 ? (
          <p className="text-gray-600">No device-level permissions assigned.</p>
        ) : (
          allowedSubModules.map((modName) => (
            <div
              key={modName}
              className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
            >
              <h3 className="text-lg font-semibold text-gray-700">
                {modName} Module
              </h3>
              <p className="text-sm text-gray-500">
                You have access to the {modName} module under Devices.
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDevices;
