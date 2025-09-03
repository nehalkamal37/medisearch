// src/pages/authentication/Login/login.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImageWithBasePath from "../../../components/image-with-base-path";
import { all_routes } from "../../../routes/all_routes";
import { Eye, EyeOff, Mail } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import BaseUrlLoader, { loadConfig } from "../../../BaseUrlLoader";

// ensure config is loaded before any API call
await loadConfig();

type PasswordField = "password";

const Login: React.FC = () => {
  const navigate = useNavigate();

  // ---- Form state ----
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // ---- UI state ----
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [passwordVisibility, setPasswordVisibility] = useState<
    Record<PasswordField, boolean>
  >({
    password: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const API_URL = `${BaseUrlLoader.API_BASE_URL}/user/login`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      // EXACT API + options you provided
      const response = await axiosInstance.post(
        API_URL,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const { accessToken, role, branchId, classType } = response.data || {};
        // same storage keys
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("role", role);
        localStorage.setItem("branchId", branchId);
        localStorage.setItem("classType", classType);
        // same redirect
        navigate("/search1");
      } else {
        setErrorMsg("Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg("Login failed. Please check your inputs and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // optional: focus the heading for a11y
    const h = document.getElementById("login-title");
    h?.focus();
  }, []);

  return (
    <>
      {/* Start Content */}
      <div className="container-fluid position-relative z-1">
        <div
          className="w-100 overflow-hidden position-relative d-flex align-items-center justify-content-center vh-100"
          style={{
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            backgroundImage:
              'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f8f9fa"/><path d="M0 50 L100 50 M50 0 L50 100" stroke="%23e9ecef" stroke-width="1"/></svg>\')',
          }}
        >
          {/* Form Container */}
          <div className="row justify-content-center w-100">
            <div className="col-xl-4 col-lg-6 col-md-8 col-sm-10">
              <div
                className="card border-0 p-4 shadow-lg rounded-4"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  boxShadow:
                    "0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)",
                }}
              >
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <Link to={(all_routes as any)?.dashboard || "/"} className="logo d-inline-block">
                      <ImageWithBasePath
                        src="assets/img/logo-dark.svg"
                        className="img-fluid h-[40]"
                        alt="Logo"
                      />
                    </Link>
                  </div>

                  <div className="text-center mb-4">
                    <h4
                      id="login-title"
                      tabIndex={-1}
                      className="fw-bold text-dark mb-1"
                    >
                      Hi, Welcome Back
                    </h4>
                    <p className="text-muted">Sign in to continue to your account</p>
                  </div>

                  {/* Error alert */}
                  {errorMsg && (
                    <div role="alert" aria-live="assertive" className="alert alert-danger">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleLogin} noValidate>
                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label fw-medium" htmlFor="email">
                        Email <span className="text-danger ms-1">*</span>
                      </label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <Mail className="fs-5 text-primary" />
                        </span>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          className="form-control border-start-0 ps-2"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          style={{ height: "48px" }}
                          aria-required="true"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                      <label className="form-label fw-medium" htmlFor="password">
                        Password <span className="text-danger ms-1">*</span>
                      </label>
                      <div className="input-group input-group-lg pass-group position-relative">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-lock fs-5 text-primary" />
                        </span>
                        <input
                          id="password"
                          name="password"
                          type={passwordVisibility.password ? "text" : "password"}
                          className="form-control border-start-0 pass-input ps-2"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          style={{ height: "48px" }}
                          aria-required="true"
                        />
                        <button
                          type="button"
                          className="input-group-text bg-white border-start-0"
                          onClick={() => togglePasswordVisibility("password")}
                          aria-label={
                            passwordVisibility.password ? "Hide password" : "Show password"
                          }
                        >
                          {passwordVisibility.password ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                    </div>

                    {/* Remember + Forgot */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div className="form-check">
                        <input className="form-check-input" id="remember_me" type="checkbox" />
                        <label htmlFor="remember_me" className="form-check-label text-body">
                          Remember Me
                        </label>
                      </div>
                      <div className="text-end">
                        <Link
                          to={(all_routes as any)?.forgotPassword || "#"}
                          className="text-primary text-decoration-none"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="mb-3">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 btn-login py-2 fw-medium"
                        style={{ borderRadius: "8px" }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </div>

                    <div className="position-relative my-4">
                      <hr className="my-4" />
                      <div className="position-absolute top-50 start-50 translate-middle px-3 bg-white">
                        <span className="text-muted small">MediSearch</span>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Footer / Branding (optional) */}
              <div className="text-center mt-3 small text-muted">
                Need an account? <Link to={(all_routes as any)?.register || "#"}>Contact admin</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Content */}
    </>
  );
};

export default Login;
