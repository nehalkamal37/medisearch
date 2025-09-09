import { Outlet, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "../components/sidebar/sidebar";
import ThemeSettings from "../components/theme-settings/themeSettings";
import { useEffect, useState, useRef } from "react";
import {
  resetMobileSidebar,
  setHiddenLayout,
  setMobileSidebar,
} from "../core/redux/sidebarSlice";
import { updateTheme } from "../core/redux/themeSlice";
import Header from "../components/header/header";

const Feature = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const themeSettings = useSelector((state: any) => state.theme.themeSettings);
  const { miniSidebar, mobileSidebar, expandMenu, hiddenLayout } = useSelector(
    (state: any) => state.sidebarSlice
  );

  const mainWrapperRef = useRef<HTMLDivElement>(null);

  const dataLayout = themeSettings["data-layout"];
  const dataWidth = themeSettings["data-width"];
  const dataSize = themeSettings["data-size"];
  const dir = themeSettings["dir"];

  const [previousPath, setPreviousPath] = useState(location.pathname);

  // Close mobile sidebar on route change
  useEffect(() => {
    dispatch(resetMobileSidebar());
  }, [location.pathname, dispatch]);

  // Route-based layout init / reset
  useEffect(() => {
    const layoutPaths = [
      "/layout-mini",
      "/layout-hoverview",
      "/layout-hidden",
      "/layout-fullwidth",
      "/layout-rtl",
      "/layout-dark",
    ];

    const isCurrentLayoutPage = layoutPaths.includes(location.pathname);
    const wasPreviousLayoutPage = layoutPaths.includes(previousPath);

    if (location.pathname === "/layout-hidden") {
      dispatch(updateTheme({ "data-layout": "hidden" }));
      dispatch(setHiddenLayout(false));
    } else if (location.pathname === "/layout-mini") {
      dispatch(updateTheme({ "data-layout": "mini" }));
    } else if (location.pathname === "/layout-hoverview") {
      dispatch(updateTheme({ "data-layout": "hoverview" }));
    } else if (location.pathname === "/layout-fullwidth") {
      dispatch(updateTheme({ "data-width": "box" }));
    } else if (location.pathname === "/layout-rtl") {
      dispatch(updateTheme({ dir: "rtl" }));
    } else if (location.pathname === "/layout-dark") {
      dispatch(
        updateTheme({
          "data-bs-theme": "dark",
          "data-sidebar": "dark",
          "data-topbar": "dark",
        })
      );
    } else if (wasPreviousLayoutPage && !isCurrentLayoutPage) {
      // Reset when leaving layout demo pages
      dispatch(
        updateTheme({
          "data-bs-theme": "light",
          "data-sidebar": "light",
          "data-color": "primary",
          "data-topbar": "white",
          "data-layout": "default",
          "data-size": "default",
          "data-width": "fluid",
          "data-sidebarbg": "none",
          dir: "ltr",
        })
      );
    }

    setPreviousPath(location.pathname);
  }, [location.pathname, dispatch, previousPath]);

  // hidden-layout helper class on body
  useEffect(() => {
    if (dataLayout === "hidden") {
      if (hiddenLayout) document.body.classList.add("hidden-layout");
      else document.body.classList.remove("hidden-layout");
    } else {
      document.body.classList.remove("hidden-layout");
    }
  }, [hiddenLayout, dataLayout]);

  // html.menu-opened for legacy styles
  useEffect(() => {
    const html = document.documentElement;
    if (mobileSidebar) html.classList.add("menu-opened");
    else html.classList.remove("menu-opened");
  }, [mobileSidebar]);

  // NEW: also mirror to body.sidebar-open (used by our sidebar CSS)
  useEffect(() => {
    const body = document.body;
    if (mobileSidebar) body.classList.add("sidebar-open");
    else body.classList.remove("sidebar-open");
  }, [mobileSidebar]);

  // Close mobile sidebar on click/touch outside
  useEffect(() => {
    const handler = (evt: MouseEvent | TouchEvent) => {
      if (!mobileSidebar) return;
      const sidebar = document.getElementById("sidebar");
      const target = evt.target as Node;
      const clickedInsideMain = mainWrapperRef.current?.contains(target);
      const clickedInsideSidebar = sidebar?.contains(target);
      if (clickedInsideSidebar) return;
      if (!clickedInsideMain) return; // only react if click is in app shell
      dispatch(setMobileSidebar(false));
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [mobileSidebar, dispatch]);

  // Bootstrap tooltips re-init
  useEffect(() => {
    // @ts-ignore
    if (window.bootstrap) {
      const old = document.querySelectorAll(".tooltip");
      old.forEach((el) => el.parentNode && el.parentNode.removeChild(el));

      const triggers = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      // @ts-ignore
      const instances = triggers.map((el) => new window.bootstrap.Tooltip(el));
      return () => {
        instances.forEach((i: any) => i?.dispose && i.dispose());
        const leftover = document.querySelectorAll(".tooltip");
        leftover.forEach((el) => el.parentNode && el.parentNode.removeChild(el));
      };
    }
  });

  return (
    <>
      <div
        className={`
          ${miniSidebar || dataLayout === "mini" || dataSize === "compact" ? "mini-sidebar" : ""}
          ${(expandMenu && miniSidebar) || (expandMenu && dataLayout === "mini") ? "expand-menu" : ""}
          ${mobileSidebar ? "menu-opened slide-nav" : ""}
          ${dataWidth === "box" ? "layout-box-mode" : ""}
          ${dir === "rtl" ? "layout-mode-rtl" : ""}
        `}
      >
        <div className="main-wrapper" ref={mainWrapperRef}>
          <Header />

          {/* Sidebar is fixed; keep it mounted here */}
          <Sidebar />

          {/* IMPORTANT: wrap your routed pages with page-content so desktop gets left margin */}
          <div className="page-content">
            <Outlet />
          </div>

          {/* {location.pathname !== "/layout-rtl" && <ThemeSettings />} */}
        </div>

        {/* Mobile overlay (tap to close) */}
        <div
          className={`sidebar-overlay${mobileSidebar ? " opened" : ""}`}
          onClick={() => mobileSidebar && dispatch(setMobileSidebar(false))}
        />
      </div>
    </>
  );
};

export default Feature;
