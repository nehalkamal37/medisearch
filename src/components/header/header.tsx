import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ImageWithBasePath from "../image-with-base-path";
import { all_routes } from "../../routes/all_routes";
import {
  setMobileSidebar,
  toggleHiddenLayout,
} from "../../core/redux/sidebarSlice";
import { updateTheme } from "../../core/redux/themeSlice";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import axiosInstance from "../../api/axiosInstance";
import { useCart } from "../CartContext";
import type { UserReadDto } from "../../types";

/* ------- RTL helpers ------- */
const loadRTLStylesheet = () => {
  const existingLink = document.getElementById("rtl-stylesheet");
  if (!existingLink) {
    const link = document.createElement("link");
    link.id = "rtl-stylesheet";
    link.rel = "stylesheet";
    link.href = "/src/assets/css/bootstrap.rtl.min.css";
    document.head.appendChild(link);
  }
};

const unloadRTLStylesheet = () => {
  const existingLink = document.getElementById("rtl-stylesheet");
  if (existingLink) existingLink.remove();
};

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const themeSettings = useSelector((state: any) => state.theme.themeSettings);
  const hiddenLayout = useSelector(
    (state: any) => state.sidebarSlice.hiddenLayout
  );
  const mobileSidebar = useSelector(
    (state: any) => state.sidebarSlice.mobileSidebar
  );

  const isLayoutPage = () => {
    const layoutPaths = [
      all_routes.layoutMini,
      all_routes.layoutHoverview,
      all_routes.layoutHidden,
      all_routes.layoutFullwidth,
      all_routes.layoutRtl,
      all_routes.layoutDark,
    ];
    return layoutPaths.includes(location.pathname);
  };

  const toggleMobileSidebar = useCallback(() => {
    dispatch(setMobileSidebar(!mobileSidebar));
  }, [dispatch, mobileSidebar]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const { cartItems } = useCart(); // only what we need now
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserReadDto | null>(null);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    }
  }, [isFullscreen]);

  const handleUpdateTheme = useCallback(
    (key: string, value: string) => {
      if (themeSettings["dir"] === "rtl" && key !== "dir") {
        dispatch(updateTheme({ dir: "ltr" }));
      }
      dispatch(updateTheme({ [key]: value }));
    },
    [dispatch, themeSettings]
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/user/UserById`);
        const data: UserReadDto = response.data;
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // apply theme attrs on <html>
  useEffect(() => {
    const htmlElement = document.documentElement as HTMLElement;
    Object.entries(themeSettings).forEach(([key, value]) => {
      htmlElement.setAttribute(key as string, String(value));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    themeSettings["data-bs-theme"],
    themeSettings["dir"],
    themeSettings["data-layout"],
    themeSettings["data-sidebar"],
    themeSettings["data-color"],
    themeSettings["data-topbar"],
    themeSettings["data-size"],
    themeSettings["data-width"],
    themeSettings["data-sidebarbg"],
  ]);

  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [signingOut, setSigningOut] = useState(false);

  const { t } = useTranslation();

  const handleToggleBtn2Click = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (themeSettings["data-layout"] === "hidden") {
        dispatch(toggleHiddenLayout());
      } else {
        toggleMobileSidebar();
      }
    },
    [dispatch, toggleMobileSidebar, themeSettings, hiddenLayout]
  );

  const handleDarkModeClick = useCallback(() => {
    handleUpdateTheme("data-bs-theme", "light");
  }, [handleUpdateTheme]);

  const handleLightModeClick = useCallback(() => {
    handleUpdateTheme("data-bs-theme", "dark");
  }, [handleUpdateTheme]);

  const handleLanguageChange = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng);
      if (lng === "ar") {
        handleUpdateTheme("dir", "rtl");
        loadRTLStylesheet();
      } else {
        handleUpdateTheme("dir", "ltr");
        unloadRTLStylesheet();
      }
    },
    [handleUpdateTheme]
  );

  useEffect(() => {
    if (i18n.language === "ar") loadRTLStylesheet();
  }, []);

  /** ----- SIGN OUT ----- */
  const handleSignOut = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.preventDefault();
      sessionStorage.setItem("softLogout", "1"); // tell login page not to auto re-auth

      const keysToRemove = [
        "token",
        "accessToken",
        "refreshToken",
        "user",
        "auth",
        "classType",
        "selectedRx",
        "selectedPcn",
        "selectedBin",
        "kpiLayout",
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();

      try {
        if (axiosInstance?.defaults?.headers?.common?.Authorization) {
          delete axiosInstance.defaults.headers.common["Authorization"];
        }
      } catch {}

      try {
        dispatch({ type: "auth/logout" });
      } catch {}

      navigate(all_routes.login, { replace: true });
    },
    [dispatch, navigate]
  );

  return (
    <>
      {/* Topbar Start */}
      <header className="navbar-header">
        <div className="page-container topbar-menu d-flex align-items-center justify-content-between">
          {/* LEFT cluster */}
          <div className="d-flex align-items-center gap-sm-2 gap-1">
            {/* Sidebar Mobile Button */}
            <Link
              id="mobile_btn"
              className="mobile-btn"
              to="#sidebar"
              onClick={toggleMobileSidebar}
              aria-label="Toggle mobile sidebar"
            >
              <i className="ti ti-menu-deep fs-24" aria-hidden="true" />
            </Link>

            {/* Logo */}
            <Link to={all_routes.dashboards} className="logo">
              <span className="logo-light">
                <span className="logo-lg">
                  <ImageWithBasePath src="assets/img/logo.svg" alt="logo" />
                </span>
              </span>
              <span className="logo-dark">
                <span className="logo-lg">
                  <ImageWithBasePath
                    src="assets/img/logo-dark.svg"
                    alt="dark logo"
                  />
                </span>
              </span>
              <span className="logo-small">
                <span className="logo-lg">
                  <ImageWithBasePath
                    src="assets/img/logo-small.svg"
                    alt="small logo"
                  />
                </span>
              </span>
            </Link>

            {/* Sidebar collapse / hidden toggle */}
            <button
              className="sidenav-toggle-btn btn border-0 p-0 active"
              id="toggle_btn2"
              onClick={handleToggleBtn2Click}
              aria-label="Toggle sidebar"
              type="button"
            >
              <i className="ti ti-arrow-bar-to-right" aria-hidden="true" />
            </button>
          </div>

          {/* RIGHT cluster */}
          <div className="d-flex align-items-center ms-auto">
            {/* Cart — now same style as other header icons */}
            <div className="header-item">
              <div className="dropdown me-2">
                <button
                  type="button"
                  className="btn topbar-link position-relative"
                  onClick={() => navigate("/cart")}
                  aria-label="Open cart"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Cart"
                >
                  <i className="ti ti-shopping-cart fs-16" aria-hidden="true" />
                  {cartItems.length > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {cartItems.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Fullscreen */}
            <div className="header-item">
              <div className="dropdown me-2">
                <Link
                  to="#"
                  className="btn topbar-link btnFullscreen"
                  onClick={toggleFullscreen}
                  aria-label="Toggle fullscreen"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Fullscreen"
                >
                  <i className="ti ti-minimize" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Theme toggle */}
            {!isLayoutPage() && (
              <div className="header-item d-flex me-2">
                <button
                  className={`topbar-link btn ${
                    themeSettings["mode"] === "dark" ? "active" : ""
                  }`}
                  id="dark-mode-toggle"
                  type="button"
                  onClick={handleDarkModeClick}
                  aria-label="Switch to light mode"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Light mode"
                >
                  <i className="ti ti-sun fs-16" aria-hidden="true" />
                </button>
                <button
                  className={`topbar-link btn ${
                    themeSettings["mode"] === "light" ? "active" : ""
                  }`}
                  id="light-mode-toggle"
                  type="button"
                  onClick={handleLightModeClick}
                  aria-label="Switch to dark mode"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Dark mode"
                >
                  <i className="ti ti-moon fs-16" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* User menu */}
            <div className="dropdown profile-dropdown d-flex align-items-center justify-content-center">
              <Link
                to="#"
                className="topbar-link dropdown-toggle drop-arrow-none position-relative"
                data-bs-toggle="dropdown"
                data-bs-offset="0,22"
                aria-haspopup="true"
                aria-expanded="false"
                aria-label="User menu"
              >
                <ImageWithBasePath
                  src="assets/img/avatars/avatar-31.jpg"
                  width={32}
                  className="rounded-2 d-flex"
                  alt="User avatar"
                />
                <span className="online text-success">
                  <i
                    className="ti ti-circle-filled d-flex bg-white rounded-circle border border-1 border-white"
                    aria-hidden="true"
                  />
                </span>
              </Link>

              <div className="dropdown-menu dropdown-menu-end dropdown-menu-md p-2">
                <div className="d-flex align-items-center bg-light rounded-3 p-2 mb-2">
                  <ImageWithBasePath
                    src="assets/img/avatars/avatar-31.jpg"
                    className="rounded-circle"
                    width={42}
                    height={42}
                    alt="User avatar"
                  />
                  <div className="ms-2">
                    <p className="fw-medium text-dark mb-0">{user?.name}</p>
                    <span className="d-block fs-13">{user?.roleName}</span>
                  </div>
                </div>

                <Link to={all_routes.generalSettings} className="dropdown-item">
                  <i
                    className="ti ti-user-circle me-2 align-middle"
                    aria-hidden="true"
                  />
                  <span className="align-middle">Profile Settings</span>
                </Link>

                <div className="pt-2 mt-2 border-top">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="dropdown-item text-danger w-100 text-start"
                  >
                    <i
                      className="ti ti-logout me-2 fs-17 align-middle"
                      aria-hidden="true"
                    />
                    <span className="align-middle">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Topbar End */}
    </>
  );
};

export default React.memo(Header);
