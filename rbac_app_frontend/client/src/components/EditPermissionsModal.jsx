import { useEffect, useState } from "react";
import api from "../api";
import { decodeToken } from "../utils/decodeToken";

function EditPermissionsModal({ admin, onClose, onSuccess }) {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const decoded = decodeToken(token);

        if (!decoded || decoded.role !== "superadmin") {
          setError("Unauthorized: Only superadmins can access this.");
          return;
        }

        const res = await api.get("/users-with-permissions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const selectedUser = res.data.find((u) => u.id === admin.id);
        setUserData(selectedUser || null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch permissions.");
      }
    };

    if (admin) {
      fetchPermissions();
    }
  }, [admin]);

  if (!admin) return null;

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}>
      <h4>Edit Permissions for: {admin.email}</h4>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!userData ? (
        <p>Loading permissions...</p>
      ) : userData.modules.length === 0 ? (
        <p>No modules or permissions assigned.</p>
      ) : (
        <ul>
          {userData.modules.map((mod, index) => (
            <li key={index}>
              Module: <strong>{mod.module_name}</strong> | Permissions:{" "}
              <strong>{mod.permissions.join(", ")}</strong>
            </li>
          ))}
        </ul>
      )}

      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default EditPermissionsModal;
