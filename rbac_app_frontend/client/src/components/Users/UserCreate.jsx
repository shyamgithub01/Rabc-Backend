import React, { useState } from "react";
import api from "../../api";

export default function UserCreate({ onClose, onSuccess }) {
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
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    setFormData((prev) => ({ ...prev, password: pass }));
    setShowPassword(true);
    setPasswordStrength(100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found.");
      }

      await api.post(
        "/users/",
        { ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("User created successfully!");
      setFormData({ email: "", password: "" });
      setShowPassword(false);
      setPasswordStrength(0);
      if (onSuccess) onSuccess();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(", "));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(err.message || "Failed to create user.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthColor =
    passwordStrength < 40
      ? "bg-red-500"
      : passwordStrength < 70
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Create User</h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 p-2 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="user@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">Password</label>
            <button
              type="button"
              onClick={generatePassword}
              className="text-xs bg-gray-800 text-white px-3 py-1 hover:bg-gray-800"
            >
              Generate
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-xs text-gray-500 hover:text-black"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Password Strength */}
          <div className="mt-2">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Password Strength</span>
              <span
                className={`${
                  passwordStrength < 40
                    ? "text-red-600"
                    : passwordStrength < 70
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {passwordStrength < 40
                  ? "Weak"
                  : passwordStrength < 70
                  ? "Medium"
                  : "Strong"}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${strengthColor} transition-all duration-500`}
                style={{ width: `${passwordStrength}%` }}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 text-sm text-white font-semibold rounded ${
              isSubmitting
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gray-800 hover:bg-black"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}
