// src/pages/authentication/Login/login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import { all_routes } from "../../../routes/all_routes";

type PasswordField = "password";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState<
    Record<PasswordField, boolean>
  >({ password: false });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post("/user/login", { email, password });
      const { accessToken, role, branchId, classType } = response.data || {};
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (role != null) localStorage.setItem("role", String(role));
      if (branchId != null) localStorage.setItem("branchId", String(branchId));
      if (classType != null) localStorage.setItem("classType", String(classType));

      navigate((all_routes as any)?.drugSearch || "/dashboard");
    } catch (err: any) {
      if (err?.response?.status === 401) setErrorMsg("Invalid credentials.");
      else if (err?.message?.includes("Network Error"))
        setErrorMsg("Network error. Check API/proxy.");
      else setErrorMsg("Login failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !!email && !!password && !isSubmitting;

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background:
          "linear-gradient(180deg, #87CEEB 0%, #E6F3FF 50%, #F0F8FF 100%)",
      }}
    >
      <div
        className="card border-0"
        style={{
          borderRadius: "20px",
          padding: "32px",
          maxWidth: "380px",
          width: "100%",
          boxShadow:
            "0 10px 25px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: "48px",
            height: "48px",
            background: "black",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          PhS
        </div>

        {/* Header */}
        <h2 className="text-center mb-2 fw-semibold">Sign in with email</h2>
        <p className="text-center text-muted mb-4" style={{ fontSize: "14px" }}>
          Use your email and password to sign in to your account
        </p>

        {/* Error */}
        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center gap-2">
            <AlertCircle size={18} /> <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-medium" htmlFor="email">
              Email
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                className="form-control border-start-0"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ height: 44 }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-medium" htmlFor="password">
              Password
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type={passwordVisibility.password ? "text" : "password"}
                className="form-control border-start-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ height: 44 }}
              />
              <button
                type="button"
                className="input-group-text bg-white border-start-0"
                onClick={() => togglePasswordVisibility("password")}
              >
                {passwordVisibility.password ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn w-100 fw-semibold"
            style={{
              background: "#111827",
              color: "white",
              height: 44,
              borderRadius: "8px",
            }}
            disabled={!canSubmit}
          >
            {isSubmitting ? "Signing in…" : "SIGN IN"}
          </button>

          {/* Divider */}
          <div className="d-flex align-items-center my-4">
            <hr className="flex-grow-1" />
            <span className="px-2 small text-muted">PharmaSearch</span>
            <hr className="flex-grow-1" />
          </div>
        </form>
      </div>

      {/* Focus styles */}
      <style>{`
        .form-control:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 0.2rem rgba(37,99,235,0.25) !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
