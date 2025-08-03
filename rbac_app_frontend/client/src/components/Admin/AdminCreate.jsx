import React, { useState } from "react";
import api from "../../api";

export default function AdminCreate({ onSuccess }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      const strength = Math.min(value.length * 10, 100);
      setPasswordStrength(strength);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
    setPasswordStrength(100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      await api.post(
        "/admins/",
        { ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("New admin created successfully!");
      setFormData({ email: "", password: "" });
      setPasswordStrength(0);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create admin. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthColor =
    passwordStrength < 40 ? "bg-red-400" :
    passwordStrength < 70 ? "bg-yellow-400" :
    "bg-green-500";

  return (
    <div className="w-full max-w-md mx-auto bg-white p-4 rounded-md shadow border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Create New Admin</h2>

      {error && <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
      {success && <div className="mb-2 p-2 bg-green-100 text-green-700 rounded text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-gray-700">Password</label>
            <button
              type="button"
              onClick={generatePassword}
              className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-400 font-semibold"
            >
              Generate Password
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 text-xs"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Password Strength</span>
              <span className={strengthColor.replace("bg-", "text-")}>
                {passwordStrength < 40 ? "Weak" : passwordStrength < 70 ? "Medium" : "Strong"}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${strengthColor}`}
                style={{ width: `${passwordStrength}%` }}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 text-sm rounded text-white font-medium transition ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-800"
          }`}
        >
          {isSubmitting ? "Creating..." : "Create Admin"}
        </button>
      </form>
    </div>
  );
}
