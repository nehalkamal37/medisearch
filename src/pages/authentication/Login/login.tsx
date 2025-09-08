// src/pages/authentication/Login/login.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImageWithBasePath from "../../../components/image-with-base-path";
import { all_routes } from "../../../routes/all_routes";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import BaseUrlLoader, { loadConfig } from "../../../BaseUrlLoader";

// Ensure config is loaded before any API call
await loadConfig();

type PasswordField = "password";

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const Login: React.FC = () => {
  const navigate = useNavigate();

  // ---- Form state ----
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // ---- UI state ----
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [passwordVisibility, setPasswordVisibility] = useState<Record<PasswordField, boolean>>({
    password: false,
  });
  const [capsLockOn, setCapsLockOn] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const emailError = useMemo(() => {
    if (!email) return "";
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    return "";
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return "";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  }, [password]);

  const isFormValid = useMemo(() => {
    return !!email && !!password && !emailError && !passwordError;
  }, [email, password, emailError, passwordError]);

  const API_URL = `${BaseUrlLoader.API_BASE_URL}/user/login`;

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // a11y: focus the heading
    headingRef.current?.focus();
  }, []);

  // Caps Lock detection
  const onPasswordKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // KeyboardEvent doesn't always expose getModifierState in older browsers, safe-guard:
    try {
      const isOn = e.getModifierState && e.getModifierState("CapsLock");
      setCapsLockOn(!!isOn);
    } catch {
      // noop
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!isFormValid) {
      setErrorMsg("Please fix the highlighted fields and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        API_URL,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const { accessToken, role, branchId, classType } = response.data || {};
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("role", role);
        localStorage.setItem("branchId", branchId);
        localStorage.setItem("classType", classType);

        if (rememberMe) {
          // Simple "remember" — store email only (never store password)
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        setSuccessMsg("Signed in successfully. Redirecting…");
        // brief UX pause feels smoother
        setTimeout(() => navigate("/search1"), 350);
      } else {
        setErrorMsg("Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg(
        err?.response?.data?.message ??
          "Login failed. Please check your inputs and try again."
      );
      // focus password on error for quick retry
      passwordRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prefill remembered email
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedEmail");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      {/* Background */}
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
      <div className="container-fluid  position-relative z-1">
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
                      style={{ height: 44 }}
                    />
                  </Link>
                </div>

                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <h4
                      id="login-title"
                      tabIndex={-1}
                      ref={headingRef}
                      className="fw-bold text-dark mb-2"
                      style={{ letterSpacing: 0.2 }}
                    >
                      Welcome back
                    </h4>
                    <p className="text-secondary mb-0">
                      Sign in to continue to your account
                    </p>
                  </div>

                  {/* Alerts */}
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
                  {successMsg && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="alert alert-success d-flex align-items-start gap-2"
                    >
                      <CheckCircle2 className="me-1" size={18} />
                      <div>{successMsg}</div>
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
                          className={`form-control border-start-0 ps-2 ${
                            emailError ? "is-invalid" : email ? "is-valid" : ""
                          }`}
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          style={{ height: 48 }}
                          aria-required="true"
                          aria-invalid={!!emailError}
                          aria-describedby={emailError ? "email-error" : undefined}
                        />
                      </div>
                      {emailError && (
                        <div id="email-error" className="invalid-feedback d-block">
                          {emailError}
                        </div>
                      )}
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
                          ref={passwordRef}
                          type={passwordVisibility.password ? "text" : "password"}
                          className={`form-control border-start-0 ps-2 ${
                            passwordError ? "is-invalid" : password ? "is-valid" : ""
                          }`}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyUp={onPasswordKey}
                          onKeyDown={onPasswordKey}
                          placeholder="••••••••"
                          style={{ height: 48 }}
                          aria-required="true"
                          aria-invalid={!!passwordError}
                          aria-describedby={
                            passwordError || capsLockOn ? "password-hint" : undefined
                          }
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
                      {(passwordError || capsLockOn) && (
                        <div id="password-hint" className="form-text text-danger">
                          {passwordError ? passwordError : null}
                          {capsLockOn && (
                            <>
                              {passwordError ? " " : null}
                              <strong>Caps Lock</strong> is on.
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Remember + Forgot 
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          id="remember_me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="remember_me" className="form-check-label text-body">
                          Remember me
                        </label>
                      </div>
                      <div className="text-end">
                        <Link
                          to={(all_routes as any)?.forgotPassword || "#"}
                          className="text-primary text-decoration-none"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>
*/}
                    {/* Submit */}
                    <div className="mb-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 py-2 fw-medium"
                        style={{ borderRadius: 10 }}
                        disabled={isSubmitting || !isFormValid}
                        aria-disabled={isSubmitting || !isFormValid}
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
                        <span className="text-muted small">MediSearch</span>
                      </div>
                    </div>
                  </form>

                  {/* Footer helper 
                  <div className="text-center small text-muted">
                    Need an account?{" "}
                    <Link to={//(all_routes as any)?.register || "#"} className="text-decoration-none">
                      Contact admin
                    </Link>
                  </div>
                  */}
                </div>
              </div>

              {/* Tiny legal / version row */}
              <div className="text-center mt-3 small text-muted">
                © {new Date().getFullYear()} MediSearch • All rights reserved
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
.all{
height:355px;
}
       ` }

      </style>
    </>
  );
};

export default Login;
