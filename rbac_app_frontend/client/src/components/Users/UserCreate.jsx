import React, { useState } from "react";
import api from "../../api";

export default function UserCreate() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await api.post(
        "/users/",
        { ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("User created successfully!");
      setCreatedUser(res.data);
      setFormData({ email: "", password: "" });
      setShowPassword(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="  bg-gray-100 rounded-lg border border-gray-300 p-2 mt-5 shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Create New Admin
      </h2>

      {error && (
        <div className="mb-4 text-sm bg-red-100 border border-red-300 text-red-700 p-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 text-sm bg-green-100 border border-green-300 text-green-700 p-3 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 w-full">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>

          <div className="flex justify-end mb-1">
            <button
              type="button"
              onClick={generatePassword}
              className="text-xs px-3 py-1 bg-[#2f3640] text-white rounded hover:bg-[#3b4252]"
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
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white pr-16 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-1 flex justify-between">
            <span>Password Strength</span>
            <span className="font-medium text-gray-500">Weak</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 text-sm font-semibold rounded text-white ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#2f3640] hover:bg-[#3b4252]"
          }`}
        >
          {isSubmitting ? "Creating..." : "Create Admin"}
        </button>
      </form>

      {createdUser && (
        <div className="mt-6 text-sm text-gray-700 bg-white p-4 rounded border border-gray-200">
          <h3 className="font-medium mb-1">Created User Details:</h3>
          <p>
            <strong>Email:</strong> {createdUser.email}
          </p>
        </div>
      )}
    </div>
  );
}
