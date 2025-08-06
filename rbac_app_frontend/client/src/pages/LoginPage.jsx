import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import decodeToken from "../utils/decodeToken";

function LoginPage({ setUserEmail }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [responseMsg, setResponseMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const colors = {
    background: "#FFFFFF", // White background
    formBackground: "#FFFFFF",
    accentGray: "#4B5563",
    buttonGray: "#000000",
    text: "#000000",
    iconGray: "#6B7280",
    placeholder: "#9CA3AF",
    teal: "#14B8A6",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponseMsg("");

    try {
      const res = await api.post("/login", { email, password });
      const { access_token } = res.data;

      localStorage.setItem("access_token", access_token);
      const decoded = decodeToken(access_token);

      if (decoded?.sub) {
        setUserEmail(decoded.sub);
        navigate("/dashboard");
      } else {
        throw new Error("Email not found in token");
      }
    } catch (err) {
      setResponseMsg("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex flex-col lg:flex-row relative overflow-hidden font-montserrat"
      style={{ height: "100vh", width: "100vw", background: colors.background }}
    >
      <div
        className="lg:w-1/2 flex items-center justify-center p-8 relative"
        style={{ height: "100vh" }}
      >
        <div className="absolute top-4 left-4">
          <img src="/image2.png" alt="Logo" className="w-30 h-30 ml-10 " />
        </div>
        <div className="relative ml-20 mt-10 rounded-2xl w-full max-w-6xl">
          <img
            src="/image.png"
            alt="Business Growth"
            className="max-w-3xl h-auto   "
            style={{ maxHeight: "80vh" }}
          />
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-teal-200 opacity-50"
                style={{
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="lg:w-1/2 flex items-center justify-center p-4 lg:p-8 relative z-10"
        style={{ height: "100vh" }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative"></div>
            </div>
            <h1
              className="text-4xl font-extrabold mb-2"
              style={{ color: colors.text }}
            >
              Business Portal
            </h1>
            <p className="text-lg font-semibold text-blue-400">
              Access tools for success
            </p>
          </div>

          <div
            className="rounded-2xl p-6 lg:p-8 shadow-2xl transform transition-all duration-300 hover:shadow-3xl"
            style={{
              backgroundColor: colors.formBackground,
              border: `1px solid ${colors.accentGray}20`,
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
            }}
          >
            {responseMsg && (
              <div className="mb-6 p-4 rounded-lg text-sm bg-red-100 text-red-700 border border-red-300 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {responseMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: colors.accentGray }}
                >
                  Email Address
                </label>
                <div className="relative group">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: colors.iconGray }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white text-black placeholder-gray-400 pl-10"
                    style={{ borderColor: colors.accentGray }}
                    placeholder="email@business.com"
                  />
                  <div className="absolute left-0 bottom-0 h-1 w-full bg-gray-600 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: colors.accentGray }}
                >
                  Password
                </label>
                <div className="relative group">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: colors.iconGray }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6-6h12m-6 2H6m0 2a2 2 0 100 4h4a2 2 0 000-4H6z"
                    />
                  </svg>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white text-black placeholder-gray-400 pr-10 pl-10"
                    style={{ borderColor: colors.accentGray }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                  <div className="absolute left-0 bottom-0 h-1 w-full bg-gray-600 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.buttonGray }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3 text-white"
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
                      Logging in...
                    </div>
                  ) : (
                    "Log In"
                  )}
                </button>
              </div>

              <div
                className="text-sm mt-4 flex items-center justify-center"
                style={{ color: colors.iconGray }}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6-6h12m-6 2H6m0 2a2 2 0 100 4h4a2 2 0 000-4H6z"
                  />
                </svg>
                Secure Connection
              </div>
            </form>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex items-center">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full mx-1"
                  style={{ backgroundColor: colors.buttonGray }}
                ></div>
              ))}
              <span
                className="ml-2 text-sm font-medium"
                style={{ color: colors.text }}
              >
                Empowering your business
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
  .font-montserrat {
    font-family: 'Montserrat', sans-serif;
  }
  input::placeholder {
    color: ${colors.placeholder};
  }
  .group:hover .group-hover\\:scale-x-100 {
    transform: scaleX(1);
  }
`}</style>
    </div>
  );
}

export default LoginPage;
