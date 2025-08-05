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

      const res = await api.post(
        "/users/",
        { ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("User created successfully! The user list will update automatically.");
      setFormData({ email: "", password: "" });
      setShowPassword(false);
      setPasswordStrength(0);
      if (onSuccess) onSuccess();
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        const formatted = detail.map((d) => d.msg).join(", ");
        setError(formatted);
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(err.message || "Failed to create user. Please try again.");
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
    <div className="w-full h-full bg-white p-8 rounded-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
      </div>

      {error && typeof error === "string" && (
        <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 text-sm text-green-700 bg-green-50 border border-green-100 px-4 py-3 rounded-xl flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="user@example.com"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-semibold text-gray-800">Password</label>
            <button
              type="button"
              onClick={generatePassword}
              className="text-xs bg-black text-white px-3 py-1.5 rounded-xl hover:bg-gray-800"
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
              className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Password strength bar */}
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-700 font-semibold">Password Strength</span>
              <span
                className={`font-semibold ${
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
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${strengthColor} transition-all duration-500`}
                style={{ width: `${passwordStrength}%` }}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 text-sm rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center ${
              isSubmitting
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-black hover:bg-gray-900"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              "Create User"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
