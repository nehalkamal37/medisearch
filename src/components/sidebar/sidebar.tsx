import { useAppDispatch, useAppSelector } from "../../core/redux/store";
import { updateTheme } from "../../core/redux/themeSlice";
import React, { useEffect, useState, useCallback } from "react";
import { setExpandMenu, setMobileSidebar, setHiddenLayout } from "../../core/redux/sidebarSlice";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import { SidebarData } from "./sidebarData";
import { all_routes } from "../../routes/all_routes";
import ImageWithBasePath from "../image-with-base-path";
import { useTranslation } from "react-i18next";

interface SidebarMenuItem {
  label: string;
  link: string;
  submenu?: boolean;
  icon?: string;
  submenuItems?: SidebarMenuItem[];
  relatedRoutes?: string[];
  count?: number;
}

const Sidebar = () => {
  const route = all_routes;
  const Location = useLocation();
  const pathname = Location.pathname;
  const [subsidebar, setSubsidebar] = useState("");
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const themeSettings = useAppSelector((state) => state.theme.themeSettings);
  const mobileSidebar = useAppSelector((state) => state.sidebarSlice.mobileSidebar);

  /** Recursively detect active route */
  const isMenuItemActive = useCallback((item: SidebarMenuItem, currentPath: string): boolean => {
    if (item.link && item.link !== "#" && item.link === currentPath) return true;
    if (item.relatedRoutes?.includes(currentPath)) return true;
    if (item.submenuItems?.length) return item.submenuItems.some((c) => isMenuItemActive(c, currentPath));
    return false;
  }, []);

  /** Auto-open submenus that contain the active route */
  useEffect(() => {
    const newOpen: Record<string, boolean> = {};
    (SidebarData as { submenuItems: SidebarMenuItem[] }[]).forEach((group) => {
      group.submenuItems?.forEach((title) => {
        if (isMenuItemActive(title, pathname)) newOpen[title.label] = true;
      });
    });
    setOpenMenus(newOpen);
  }, [pathname, isMenuItemActive]);

  const handleMenuToggle = useCallback((label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const toggleSubsidebar = useCallback((label: string) => {
    setSubsidebar((prev) => (label === prev ? "" : label));
  }, []);

  /** Toggle: default <-> mini */
  const handleMiniSidebar = useCallback(() => {
    if (themeSettings["data-layout"] === "hidden") {
      // unhide and go to default
      dispatch(setHiddenLayout(false));
      dispatch(updateTheme({ "data-layout": "default" }));
      return;
    }

    const root = document.documentElement;
    const isMini = root.getAttribute("data-layout") === "mini";
    const nextLayout = isMini ? "default" : "mini";

    dispatch(updateTheme({ "data-layout": nextLayout }));

    // sync legacy helper
    if (nextLayout === "mini") root.classList.add("mini-sidebar");
    else root.classList.remove("mini-sidebar");
  }, [dispatch, themeSettings]);

  /** HOVER: when in mini, hovering should behave like toggle ON (temporarily) */
  const onMouseEnter = useCallback(() => {
    dispatch(setExpandMenu(true));
    const root = document.documentElement;
    if (root.getAttribute("data-layout") === "mini") {
      root.classList.add("sidebar-hovering"); // temp state
    }
  }, [dispatch]);

  const onMouseLeave = useCallback(() => {
    dispatch(setExpandMenu(false));
    const root = document.documentElement;
    root.classList.remove("sidebar-hovering"); // revert temp state
  }, [dispatch]);

  /** Handle switching layouts from the Layout menu (kept) */
  const handleLayoutClick = useCallback(
    (layout: string) => {
      const layoutSettings: any = { "data-layout": "default", dir: "ltr" };
      switch (layout) {
        case "Default":
          layoutSettings["data-layout"] = "default";
          break;
        case "Hidden":
          layoutSettings["data-layout"] = "hidden";
          dispatch(setHiddenLayout(true));
          break;
        case "Mini":
          layoutSettings["data-layout"] = "mini";
          break;
        case "Hover View":
          layoutSettings["data-layout"] = "hoverview";
          break;
        case "Full Width":
          layoutSettings["data-layout"] = "full-width";
          break;
        case "Dark":
          layoutSettings["data-bs-theme"] = "dark";
          break;
        case "RTL":
          layoutSettings.dir = "rtl";
          break;
        default:
          break;
      }
      dispatch(updateTheme(layoutSettings));
      navigate("/dashboard");
    },
    [dispatch, navigate]
  );

  /** Keep <html> attributes synced with themeSettings */
  useEffect(() => {
    const root: any = document.documentElement;
    Object.entries(themeSettings).forEach(([k, v]) => root.setAttribute(k, v));

    // Mini helper
    if (themeSettings["data-layout"] === "mini") root.classList.add("mini-sidebar");
    else root.classList.remove("mini-sidebar");

    // If not mini, ensure hover temp class is gone
    if (themeSettings["data-layout"] !== "mini") root.classList.remove("sidebar-hovering");
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

  /** Mirror redux mobileSidebar -> body class for drawer behavior */
  useEffect(() => {
    const body = document.body;
    if (mobileSidebar) body.classList.add("sidebar-open");
    else body.classList.remove("sidebar-open");
  }, [mobileSidebar]);

  return (
    <>
      <div
        className="sidebar"
        id="sidebar"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        tabIndex={-1}
      >
        {/* Logo + toggles */}
        {/* removed mr-10 to decrease right spacing */}
        <div className="sidebar-logo">
          <div>
            <Link to={route.dashboard1} className="logo logo-normal">
              <ImageWithBasePath src="assets/img/logo.svg" alt="Logo" />
            </Link>
            <Link to={route.dashboard2} className="logo-small">
              <ImageWithBasePath src="assets/img/logo-small.svg" alt="Logo" />
            </Link>
            <Link to={route.dashboard3} className="dark-logo">
              <ImageWithBasePath src="assets/img/logo-dark.svg" alt="Logo" />
            </Link>
          </div>

          {/* Toggle: default <-> mini */}
          <button
            className="sidenav-toggle-btn btn border-0 p-0 active"
            id="toggle_btn"
            onClick={handleMiniSidebar}
            type="button"
            aria-label="Toggle sidebar width"
          >
            <i className="ti ti-arrow-bar-to-left" />
          </button>

          {/* Close (mobile) */}
          <button className="sidebar-close" onClick={() => dispatch(setMobileSidebar(false))} type="button">
            <i className="ti ti-x align-middle" />
          </button>
        </div>

        {/* Menu */}
        <div className="sidebar-inner" data-simplebar="">
          <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
            <div id="sidebar-menu" className="sidebar-menu">
              <ul>
                {SidebarData?.map((group, gi) => (
                  <React.Fragment key={`g-${gi}`}>
                    <li className="menu-title">
                      <span>{t(`sidebarTitles.${(group as any).tittle}`)}</span>
                    </li>

                    {((group as any).submenuItems as SidebarMenuItem[])?.map((title, i) => {
                      const active = isMenuItemActive(title, Location.pathname);
                      const open = openMenus[title.label] || false;

                      return (
                        <li className="submenu" key={`t-${i}`}>
                          <Link
                            to={title.submenu ? "#" : title.link}
                            onClick={() => {
                              handleMenuToggle(title.label);
                              if ((group as any).tittle === "Layout") handleLayoutClick(title.label);
                            }}
                            className={`${active ? "active" : ""} ${open ? "subdrop" : ""}`}
                            tabIndex={0}
                          >
                            <i className={`ti ti-${title.icon}`} />
                            <span>{t(`sidebar.${title.label}`, title.label)}</span>
                            {title.label === "Changelog" && (
                              <span className="badge badge-sm bg-success" style={{ marginLeft: 8 }}>
                                v1.0
                              </span>
                            )}
                            {!!title.count && <span className="count">{title.count}</span>}
                            {title.submenu && <span className="menu-arrow" />}
                          </Link>

                          {title.submenu && (
                            <ul style={{ display: open ? "block" : "none" }}>
                              {title.submenuItems?.map((item, j) => {
                                const subActive = isMenuItemActive(item, Location.pathname);
                                const isOpen = subsidebar === item.label;
                                return (
                                  <li
                                    className={`${item.submenuItems ? "submenu submenu-two" : ""}`}
                                    key={`i-${j}`}
                                  >
                                    <Link
                                      to={item.submenu ? "#" : item.link}
                                      className={`${subActive ? "active subdrop" : ""} ${isOpen ? "subdrop" : ""}`}
                                      onClick={() => {
                                        toggleSubsidebar(item.label);
                                        if (title.label === "Layouts") handleLayoutClick(item.label);
                                      }}
                                      tabIndex={0}
                                    >
                                      {t(`sidebar.${item.label}`, item.label)}
                                      {item.submenu && <span className="menu-arrow custome-menu" />}
                                    </Link>

                                    {item.submenuItems && (
                                      <ul style={{ display: isOpen ? "block" : "none" }}>
                                        {item.submenuItems.map((leaf, k) => {
                                          const leafActive = isMenuItemActive(leaf, Location.pathname);
                                          return (
                                            <li key={`leaf-${k}`}>
                                              <Link
                                                to={leaf.submenu ? "#" : leaf.link}
                                                className={`${leafActive ? "active" : ""}`}
                                                tabIndex={0}
                                              >
                                                {t(`sidebar.${leaf.label}`, leaf.label)}
                                              </Link>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </React.Fragment>
                ))}
              </ul>
            </div>
          </OverlayScrollbarsComponent>
        </div>
      </div>

      {/* Sidebar + layout CSS */}
      <style>{`
        :root {
          /* Control your widths here */
          --sidebar-w: 260px;       /* full width (Default) */
          --sidebar-w-mini: 84px;   /* mini width */

          /* NEW: tighten right spacing inside the sidebar */
          --sidebar-pad-left: 12px;   /* left padding inside sidebar */
          --sidebar-pad-right: 8px;   /* RIGHT padding inside sidebar (smaller = tighter) */
          --sidebar-link-pr: 14px;    /* RIGHT padding for menu links (room for arrow/badge) */
        }

        .sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 1040;
          transform: translateX(-100%);
          transition: transform .2s ease, width .2s ease;
        }

        /* Tighter inner padding so the content sits closer to the right edge */
        .sidebar .sidebar-inner {
          height: 100%;
          padding: 0 var(--sidebar-pad-right) 0 var(--sidebar-pad-left);
        }

        /* Tighten link right padding (all levels) */
        .sidebar .sidebar-menu > ul > li > a,
        .sidebar .sidebar-menu ul li > a {
          padding-right: var(--sidebar-link-pr) !important;
        }

        /* Optional: keep arrows/counters aligned closer to the edge */
        .sidebar .menu-arrow { right: 8px; }
        .sidebar .count { right: 8px; }

        /* ===== Desktop (lg+) ===== */
        @media (min-width: 992px) {
          html[data-layout="default"] .sidebar,
          html[data-layout="mini"] .sidebar {
            transform: translateX(0);
          }

          html[data-layout="default"] .sidebar { width: var(--sidebar-w); }
          html[data-layout="mini"] .sidebar { width: var(--sidebar-w-mini); }

          html[data-layout="default"] .page-content {
            margin-left: var(--sidebar-w);
            transition: margin-left .2s ease;
          }
          html[data-layout="mini"] .page-content {
            margin-left: var(--sidebar-w-mini);
            transition: margin-left .2s ease;
          }

          /* Hover: mini behaves like default temporarily */
          html[data-layout="mini"].sidebar-hovering .sidebar { width: var(--sidebar-w); }
          html[data-layout="mini"].sidebar-hovering .page-content { margin-left: var(--sidebar-w); }

          /* RTL mirrors */
          html[dir="rtl"][data-layout="default"] .page-content { margin-right: var(--sidebar-w); margin-left: 0; }
          html[dir="rtl"][data-layout="mini"] .page-content { margin-right: var(--sidebar-w-mini); margin-left: 0; }
          html[dir="rtl"][data-layout="mini"].sidebar-hovering .page-content { margin-right: var(--sidebar-w); margin-left: 0; }

          html[data-layout="hidden"] .page-content,
          html[data-layout="hoverview"] .page-content,
          html[data-layout="full-width"] .page-content {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
        }

        /* ===== Mobile & Tablet (<lg) ===== */
        @media (max-width: 991.98px) {
          .sidebar { width: var(--sidebar-w); }
          body.sidebar-open .sidebar { transform: translateX(0); }
          .page-content { margin-left: 0 !important; margin-right: 0 !important; }
        }

        body.sidebar-open { overflow: hidden; }
      `}</style>
    </>
  );
};

export default React.memo(Sidebar);
