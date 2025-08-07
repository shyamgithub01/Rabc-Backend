import React, { useState, useRef } from "react";
import api from "../../api";

const MIDNIGHT_BLUE = "#41729f";
const BLUE_GRAY = "#5885af";
const DARK_BLUE = "#274472";
const BABY_BLUE = "#c3e0e5";

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
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6" style={{ color: DARK_BLUE }}>Create New Admin</h2>

      {error && (
        <div className="mb-6 p-3 text-sm font-medium text-red-700 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-3 text-sm font-medium text-green-700 bg-green-50 rounded-md border border-green-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <label 
            htmlFor={emailId}
            className="block text-sm font-medium" 
            style={{ color: BLUE_GRAY }}
          >
            Email address
          </label>
          <input
            id={emailId}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 text-base border rounded-md focus:outline-none focus:ring-2"
            style={{ 
              borderColor: BABY_BLUE,
              focusRingColor: MIDNIGHT_BLUE,
              focusBorderColor: 'transparent'
            }}
            placeholder="admin@example.com"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label 
              htmlFor={passwordId}
              className="block text-sm font-medium"
              style={{ color: BLUE_GRAY }}
            >
              Password
            </label>
            <button
              type="button"
              onClick={generatePassword}
              className="text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              style={{ 
                backgroundColor: MIDNIGHT_BLUE,
                color: '#ffffff',
                hover: { backgroundColor: DARK_BLUE }
              }}
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
              className="w-full px-4 py-2.5 text-base border rounded-md pr-12 focus:outline-none focus:ring-2"
              style={{ 
                borderColor: BABY_BLUE,
                focusRingColor: MIDNIGHT_BLUE,
                focusBorderColor: 'transparent'
              }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium transition-colors"
              style={{ 
                color: BLUE_GRAY,
                hover: { color: DARK_BLUE }
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs" style={{ color: BLUE_GRAY }}>
            Password must be at least 8 characters with uppercase, lowercase, number, and symbol.
          </p>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 text-base font-semibold text-white rounded-md transition-colors"
            style={{
              backgroundColor: isSubmitting ? '#6b7280' : MIDNIGHT_BLUE,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              focusRingColor: DARK_BLUE
            }}
          >
            {isSubmitting ? "Creating..." : "Create Admin"}
          </button>
        </div>
      </form>
    </div>
  );
}