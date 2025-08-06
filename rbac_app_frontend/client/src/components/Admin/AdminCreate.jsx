import React, { useState, useRef } from "react";
import api from "../../api";

export default function AdminCreate({ onSuccess }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Create unique IDs for accessibility
  const emailId = useRef(`email-${Math.random().toString(36).substring(2, 11)}`).current;
  const passwordId = useRef(`password-${Math.random().toString(36).substring(2, 11)}`).current;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*()";
    
    // Ensure password contains at least one character from each set
    let password = [
      uppercase[Math.floor(Math.random() * uppercase.length)],
      lowercase[Math.floor(Math.random() * lowercase.length)],
      digits[Math.floor(Math.random() * digits.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ].join('');
    
    // Fill remaining characters with combined set
    const allChars = uppercase + lowercase + digits + symbols;
    for (let i = password.length; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password characters
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
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
      // Handle validation errors (422 status)
      if (err.response?.status === 422 && Array.isArray(err.response?.data?.detail)) {
        const errorMessages = err.response.data.detail.map(d => d.msg);
        setError(errorMessages.join(". "));
      } else {
        setError(err.response?.data?.detail || "Failed to create admin.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=" ">
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
          <label 
            htmlFor={emailId}
            className="block text-sm font-medium mb-1"
          >
            Email
          </label>
          <input
            id={emailId}
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
            <label 
              htmlFor={passwordId}
              className="block text-sm font-medium"
            >
              Password
            </label>
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
              id={passwordId}
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
              aria-label={showPassword ? "Hide password" : "Show password"}
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