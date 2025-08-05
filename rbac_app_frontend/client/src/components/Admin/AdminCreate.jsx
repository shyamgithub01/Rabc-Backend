import React, { useState } from "react";
import api from "../../api";

export default function AdminCreate({ onSuccess }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
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
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=" ">
      {/* Close Button */}
     

      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Create Admin</h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-2">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 p-2">
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
            placeholder="admin@example.com"
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
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 text-sm text-white font-semibold ${
              isSubmitting
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gray-800 hover:bg-black"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Admin"}
          </button>
        </div>
      </form>
    </div>
  );
}