import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { username, password, confirmPassword } = formData;

    if (!username || !password) {
      toast.error("Please fill in all required fields!");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long!");
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long!");
      return;
    }

    const performAuth = async () => {
      try {
        if (isLogin) {
          const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          const data = await response.json();

          if (!response.ok) {
            toast.error(data.error || "Invalid username or password!");
            return;
          }

          toast.success("Successfully logged in!");
          setTimeout(() => {
            onLogin(data.user.username);
          }, 1000);
        } else {
          // Sign Up flow
          if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
          }

          const response = await fetch("http://localhost:3000/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          const data = await response.json();

          if (!response.ok) {
            toast.error(data.error || "Signup failed!");
            return;
          }

          toast.success("Registration successful! You can now log in.");
          setIsLogin(true);
          setFormData({
            username: "",
            password: "",
            confirmPassword: "",
          });
        }
      } catch (err) {
        console.error("Auth error:", err);
        toast.error("Unable to connect to the authentication server.");
      }
    };

    performAuth();
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 relative overflow-hidden transition-all duration-300 hover:shadow-blue-500/10 hover:border-white/30">
          {/* Decorative gradients */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col items-center gap-2 mb-6">
            <h1 className="text-4xl font-bold text-center text-white select-none">
              <span className="text-blue-400"> &lt;</span>
              Pass
              <span className="text-blue-400">Op/ &gt;</span>
            </h1>
            <p className="text-slate-300 text-sm font-medium tracking-wide">
              {isLogin ? "Unlock your secure vault" : "Create your credentials vault"}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-black/30 p-1 rounded-full mb-6 border border-white/5">
            <button
              onClick={() => {
                setIsLogin(true);
                setFormData({ username: "", password: "", confirmPassword: "" });
              }}
              type="button"
              className={`flex-1 py-2 text-center text-sm font-semibold rounded-full cursor-pointer transition-all duration-300 ${
                isLogin
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setFormData({ username: "", password: "", confirmPassword: "" });
              }}
              type="button"
              className={`flex-1 py-2 text-center text-sm font-semibold rounded-full cursor-pointer transition-all duration-300 ${
                !isLogin
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username field */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 text-xs font-semibold px-1">
                Username
              </label>
              <input
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter Username"
                className="rounded-xl bg-white/5 text-white border border-white/10 p-3 py-2.5 w-full focus:outline-none focus:border-blue-500 focus:bg-white/10 placeholder-slate-500 transition-all text-sm"
                type="text"
                name="username"
                autoComplete="username"
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 text-xs font-semibold px-1">
                Password
              </label>
              <div className="relative">
                <input
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  className="rounded-xl bg-white/5 text-white border border-white/10 p-3 py-2.5 w-full focus:outline-none focus:border-blue-500 focus:bg-white/10 placeholder-slate-500 transition-all text-sm pr-11"
                  name="password"
                  autoComplete="current-password"
                />
                <span
                  className="absolute right-3 top-3 cursor-pointer select-none"
                  onClick={togglePassword}
                >
                  {showPassword ? (
                    <img
                      src="/icons/close eye.png"
                      alt="hide password"
                      className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <img
                      src="/icons/open eye.png"
                      alt="show password"
                      className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity"
                    />
                  )}
                </span>
              </div>
            </div>

            {/* Confirm Password field (Sign Up only) */}
            {!isLogin && (
              <div className="flex flex-col gap-1 transition-all duration-300">
                <label className="text-slate-300 text-xs font-semibold px-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="rounded-xl bg-white/5 text-white border border-white/10 p-3 py-2.5 w-full focus:outline-none focus:border-blue-500 focus:bg-white/10 placeholder-slate-500 transition-all text-sm pr-11"
                    name="confirmPassword"
                    autoComplete="new-password"
                  />
                  <span
                    className="absolute right-3 top-3 cursor-pointer select-none"
                    onClick={toggleConfirmPassword}
                  >
                    {showConfirmPassword ? (
                      <img
                        src="/icons/close eye.png"
                        alt="hide password"
                        className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <img
                        src="/icons/open eye.png"
                        alt="show password"
                        className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity"
                      />
                    )}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="mt-4 text-white text-center font-bold hover:cursor-pointer justify-center bg-blue-600 hover:bg-blue-500 rounded-xl p-3 flex gap-2 items-center border border-blue-500 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all text-sm cursor-pointer"
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </button>

            <p className="text-center text-xs text-slate-400 mt-4 select-none">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ username: "", password: "", confirmPassword: "" });
                }}
                className="text-blue-400 hover:underline cursor-pointer font-semibold"
              >
                {isLogin ? "Sign Up now" : "Sign In instead"}
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
