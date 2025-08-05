import React, { useEffect, useState } from "react";
import api from "../../api";

const UserDevices = () => {
  const [hasViewPermission, setHasViewPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  const decodeEmail = () => {
    try {
      const token = localStorage.getItem("access_token");
      const [, payload] = token.split(".");
      return JSON.parse(atob(payload)).sub;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const email = decodeEmail();

        const res = await api.get("/users-with-permissions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const currentUser = res.data.find((u) => u.email === email);
        const devicesModule = currentUser?.modules.find(
          (mod) => mod.module_name === "Devices"
        );

        const hasView = devicesModule?.permissions.includes("view") || false;
        setHasViewPermission(hasView);
      } catch (err) {
        console.error("Failed to fetch permissions", err);
        setHasViewPermission(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Loading devices...
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="text-center text-red-600 mt-10 font-medium">
        You do not have permission to view Devices.
      </div>
    );
  }

  return (
    <div className="p-6 text-gray-800">
      {/* ✅ Replace this with your actual device content later */}
      <h2 className="text-2xl font-bold mb-4">Your Devices</h2>
      <p className="text-sm">This content is visible because you have the "view" permission for the Devices module.</p>
    </div>
  );
};

export default UserDevices;
