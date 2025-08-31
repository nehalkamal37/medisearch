import { Link, useNavigate } from "react-router-dom";
import ImageWithBasePath from "../../../components/image-with-base-path";
import { all_routes } from "../../../routes/all_routes";
import { useState } from "react";
type PasswordField = "password" | "confirmPassword";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "admin@dreamsemr.com",
    password: "admin123"
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fake authentication - check if credentials match
    if (formData.email === "admin@dreamsemr.com" && formData.password === "admin123") {
      // Simulate loading state
      const loginButton = document.querySelector('.btn-login') as HTMLButtonElement;
      if (loginButton) {
        loginButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing In...';
        loginButton.disabled = true;
      }
      
      // Simulate API delay
      setTimeout(() => {
        // Store fake auth token
        localStorage.setItem('authToken', 'fake-jwt-token-12345');
        localStorage.setItem('userEmail', formData.email);
        
        // Redirect to dashboard
        navigate(all_routes.dashboard);
      }, 1500);
    } else {
      alert('Invalid credentials. Please use admin@dreamsemr.com / admin123');
    }
  };
  
  return (
    <>
      {/* Start Content */}
      <div className="container-fluid position-relative z-1">
        <div className="w-100 overflow-hidden position-relative d-flex align-items-center justify-content-center vh-100" 
             style={{ 
               background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
               backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><rect width=\"100\" height=\"100\" fill=\"%23f8f9fa\"/><path d=\"M0 50 L100 50 M50 0 L50 100\" stroke=\"%23e9ecef\" stroke-width=\"1\"/></svg>')"
             }}>
          {/* Form Container */}
          <div className="row justify-content-center w-100">
            <div className="col-xl-4 col-lg-6 col-md-8 col-sm-10">
              <div className="card border-0 p-4 shadow-lg rounded-4" 
                   style={{
                     backgroundColor: "rgba(255, 255, 255, 0.95)",
                     backdropFilter: "blur(10px)",
                     boxShadow: "0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)"
                   }}>
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <Link to={all_routes.dashboard} className="logo d-inline-block">
                      <ImageWithBasePath
                        src="assets/img/logo-dark.svg"
                        className="img-fluid"
                        alt="Logo"
                        style={{ height: "40px" }}
                      />
                    </Link>
                  </div>
                  <div className="text-center mb-4">
                    <h4 className="fw-bold text-dark mb-1">Hi, Welcome Back</h4>
                    <p className="text-muted">Sign in to continue to your account</p>
                  </div>
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Email<span className="text-danger ms-1">*</span>
                      </label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-mail fs-5 text-primary" />
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-control border-start-0 ps-2"
                          required
                          style={{ height: "48px" }}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Password<span className="text-danger ms-1">*</span>
                      </label>
                      <div className="input-group input-group-lg pass-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-lock fs-5 text-primary" />
                        </span>
                        <input
                          type={passwordVisibility.password ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="form-control border-start-0 pass-input ps-2"
                          required
                          style={{ height: "48px" }}
                        />
                        <span
                          className={`input-group-text toggle-password ${passwordVisibility.password ? "ti-eye" : "ti-eye-off"} cursor-pointer`}
                          onClick={() => togglePasswordVisibility("password")}
                        ></span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div className="d-flex align-items-center">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            id="remember_me"
                            type="checkbox"
                          />
                          <label
                            htmlFor="remember_me"
                            className="form-check-label text-body"
                          >
                            Remember Me
                          </label>
                        </div>
                      </div>
                      <div className="text-end">
                        <Link
                          to={all_routes.forgotPassword}
                          className="text-primary text-decoration-none"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                    <div className="mb-3">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 btn-login py-2 fw-medium"
                        style={{ borderRadius: "8px" }}
                      >
                        Sign In
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
            </div>
          </div>
        </div>
      </div>
      {/* End Content */}
    </>
  )
}

export default Login;