// src/pages/authentication/Login/login.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImageWithBasePath from "../../../components/image-with-base-path";
import { all_routes } from "../../../routes/all_routes";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      // keep the simple instance-based call
      const response = await axiosInstance.post("/user/login", { email, password });

      const { accessToken, role, branchId, classType } = response.data || {};
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (role != null) localStorage.setItem("role", String(role));
      if (branchId != null) localStorage.setItem("branchId", String(branchId));
      if (classType != null) localStorage.setItem("classType", String(classType));

      const NEXT =
        (all_routes as any)?.drugSearch ||
        (all_routes as any)?.dashboard ||
        "/dashboard";
      navigate(NEXT);
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err?.response?.status === 401) {
        setErrorMsg("Invalid credentials. Please try again.");
      } else if (err?.message?.includes("Network Error")) {
        setErrorMsg("Network error. Check your API/proxy settings.");
      } else {
        setErrorMsg("Login failed. Please check your inputs and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !!email && !!password && !isSubmitting;

  return (
    <>
      {/* Background gradient */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        aria-hidden="true"
        style={{
          background: "linear-gradient(135deg, #e6f0ff 0%, #f7f9fc 60%, #eef2f7 100%)",
        }}
      />
      {/* Subtle pattern overlay */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        aria-hidden="true"
        style={{
          opacity: 0.35,
          backgroundImage:
            'radial-gradient(circle at 20% 10%, rgba(0, 102, 255, 0.08) 0 12%, transparent 13%), radial-gradient(circle at 80% 30%, rgba(0, 153, 255, 0.08) 0 12%, transparent 13%), radial-gradient(circle at 40% 80%, rgba(0, 51, 153, 0.08) 0 12%, transparent 13%)',
        }}
      />

      {/* Main */}
      <div className="container-fluid position-relative z-1">
        <div className="w-100 d-flex align-items-center justify-content-center vh-100 p-3">
          <div className="row justify-content-center w-100">
            <div className="col-xl-4 col-lg-6 col-md-7 col-sm-10">
              <div
                className="card border-0 shadow-lg rounded-4 overflow-hidden"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.86)",
                  backdropFilter: "blur(10px)",
                  boxShadow:
                    "0 18px 45px rgba(16, 24, 40, 0.08), 0 8px 20px rgba(16, 24, 40, 0.06)",
                }}
              >
                {/* Brand / Header */}
                <div className="p-4 pb-0 text-center">
                  <Link
                    to={(all_routes as any)?.dashboard || "/"}
                    className="d-inline-flex align-items-center justify-content-center text-decoration-none"
                    aria-label="Go to home"
                  >
                    <ImageWithBasePath
                      src="assets/img/logo-dark.svg"
                      className="img-fluid"
                      alt="Logo"
                      // style={{ height: 44 }}
                    />
                  </Link>
                </div>

                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <h4
                      id="login-title"
                      className="fw-bold text-dark mb-2"
                      style={{ letterSpacing: 0.2 }}
                    >
                      Welcome back
                    </h4>
                    <p className="text-secondary mb-0">
                      Sign in to continue to your account
                    </p>
                  </div>

                  {/* Error alert */}
                  {errorMsg && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="alert alert-danger d-flex align-items-start gap-2"
                    >
                      <AlertCircle className="me-1" size={18} />
                      <div>{errorMsg}</div>
                    </div>
                  )}

                  {/* Form */}
                  <form className="all" onSubmit={handleLogin} noValidate>
                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label fw-medium" htmlFor="email">
                        Email <span className="text-danger ms-1">*</span>
                      </label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <Mail className="text-primary" size={18} />
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
                          style={{ height: 48 }}
                          aria-required="true"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                      <label className="form-label fw-medium" htmlFor="password">
                        Password <span className="text-danger ms-1">*</span>
                      </label>
                      <div className="input-group input-group-lg position-relative">
                        <span className="input-group-text bg-light border-end-0">
                          <Lock className="text-primary" size={18} />
                        </span>
                        <input
                          id="password"
                          name="password"
                          type={passwordVisibility.password ? "text" : "password"}
                          className="form-control border-start-0 ps-2"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          style={{ height: 48 }}
                          aria-required="true"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="input-group-text bg-white border-start-0"
                          onClick={() => togglePasswordVisibility("password")}
                          aria-label={
                            passwordVisibility.password ? "Hide password" : "Show password"
                          }
                        >
                          {passwordVisibility.password ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="mb-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 py-2 fw-medium"
                        style={{ borderRadius: 10 }}
                        disabled={!canSubmit}
                        aria-disabled={!canSubmit}
                      >
                        {isSubmitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            />
                            Signing in…
                          </>
                        ) : (
                          "Sign in"
                        )}
                      </button>
                    </div>

                    {/* Divider / Watermark */}
                    <div className="position-relative my-4">
                      <hr className="my-4" />
                      <div className="position-absolute top-50 start-50 translate-middle px-3 bg-white">
                        <span className="text-muted small">PharmaSearch</span>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Tiny legal / version row */}
              <div className="text-center mt-3 small text-muted">
                © {new Date().getFullYear()} PharmaSearch • All rights reserved
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isSubmitting && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(2px)", zIndex: 1080 }}
          aria-hidden="true"
        >
          <div className="d-inline-flex align-items-center gap-2 bg-white px-3 py-2 rounded-3 shadow-sm">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            <span className="small">Verifying credentials…</span>
          </div>
        </div>
      )}

      <style>{`
        .all { height: 320px; }
      `}</style>
    </>
  );
};

export default Login;
