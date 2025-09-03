import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Pill } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import BaseUrlLoader, { loadConfig } from "../../../BaseUrlLoader";
import { motion } from "framer-motion";

// Ensure configuration is loaded before rendering
await loadConfig();

export const Loginold: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = `${BaseUrlLoader.API_BASE_URL}/user/login`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        API_URL,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const { accessToken, role } = response.data;
        console.log("Login successful:", response.data);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("role", role);
        localStorage.setItem("branchId", response.data.branchId);

        localStorage.setItem("classType", response.data.classType);

        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your inputs and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Focus on main heading on load
    const heading = document.getElementById("page-title");
    heading?.focus();
  }, []);

  return (
    <>
      {/* Skip to main content for screen reader and keyboard users */}
      <a
        href="#login-form"
        className="sr-only focus:not-sr-only p-4 bg-white text-blue-600"
      >
        Skip to login form
      </a>

      <main
        id="main-content"
        role="main"
        className="min-h-screen flex flex-col md:flex-row"
      >
        {/* Left Column: Form */}
        <section className="w-full md:w-1/2 bg-white dark:bg-gray-800 flex items-center justify-center p-8">
          <div className="max-w-sm w-full">
            {/* Logo Placeholder */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0, opacity: 0 }}
              animate={
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? {}
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
              aria-hidden="true"
            >
              <Pill className="h-16 w-16 text-blue-600" />
            </motion.div>

            <a
              href="/"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              ← Back to home
            </a>

            <h1
              id="page-title"
              tabIndex={-1}
              className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 focus:outline-none"
            >
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
              Login to see your prescriptions and access your dashboard.
            </p>

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 p-3 rounded-md mb-4"
              >
                {error}
              </div>
            )}

            <form
              id="login-form"
              onSubmit={handleSubmit}
              className="space-y-6"
              noValidate
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    placeholder="you@example.com"
                    aria-required="true"
                    aria-describedby="email-desc"
                    required
                  />
                  <Mail
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
                    aria-hidden="true"
                  />
                </div>
                <p id="email-desc" className="sr-only">
                  Enter your registered email address.
                </p>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    placeholder="••••••••"
                    aria-required="true"
                    aria-describedby="password-desc"
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p id="password-desc" className="sr-only">
                  Enter your account password.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Info */}
        <aside
          aria-labelledby="info-title"
          className="hidden md:flex md:w-1/2 items-center justify-center p-10 bg-gradient-to-br from-blue-900 to-blue-700 dark:from-blue-800 dark:to-blue-600"
        >
          <div className="text-center text-white space-y-6">
            <motion.div
              whileHover={
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? {}
                  : { scale: 1.05 }
              }
              transition={{ duration: 0.2 }}
              className="flex justify-center"
              aria-hidden="true"
            >
              <Pill className="h-16 w-16" />
            </motion.div>
            <h2 id="info-title" className="text-3xl font-bold">
              medsearch
            </h2>
            <p className="text-base md:text-lg opacity-90">
              Your Guide For a Better Medication Experience
            </p>
            <a
              href="/about"
              className="inline-block px-6 py-3 border border-white rounded-full text-white font-semibold hover:bg-white hover:text-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Learn More
            </a>
          </div>
        </aside>
      </main>
    </>
  );
};

export default Loginold;
