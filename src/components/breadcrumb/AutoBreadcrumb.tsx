import React, { useMemo } from "react";
import { useLocation, matchPath } from "react-router-dom";
import Breadcrumb from "./breadcrumb";
import { all_routes } from "../../routes/all_routes";
import { SidebarData } from "../sidebar/sidebarData";

// Optional segment labels
const LABELS: Record<string, string> = {
  "": "Home",
  "base-ui": "Base UI",
  "accordions": "Accordions",
};

type Crumb = { label: string; href?: string };

function humanize(value: string): string {
  return decodeURIComponent(value)
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalizeLabel(node: any): string | undefined {
  return node?.label ?? node?.title ?? node?.tittle ?? undefined;
}

function isValidItemsArray(items: any): items is any[] {
  return Array.isArray(items) && items.length > 0;
}

function isValidLink(link: any): link is string {
  return typeof link === "string" && link.length > 0 && link !== "#";
}

function linkMatchesPath(link: string, pathname: string): boolean {
  if (link === pathname) return true;
  if (link.includes(":")) {
    // Support dynamic patterns like /InsuranceDetails/:insuranceName
    return !!matchPath({ path: link, end: true }, pathname);
  }
  return false;
}

/**
 * Safely walk SidebarData and try to build a breadcrumb path that matches pathname.
 * Returns an array of Crumbs, or [] if no match was found.
 */
function findSidebarPath(pathname: string): Crumb[] {
  let result: Crumb[] = [];

  const recurse = (items: any, path: Crumb[]): boolean => {
    if (!isValidItemsArray(items)) return false;

    for (const item of items) {
      if (!item) continue;

      const label =
        normalizeLabel(item) ??
        (isValidLink(item.link) ? humanize(item.link.split("/").filter(Boolean).slice(-1)[0] || "") : ""); // fallback

      const href = isValidLink(item?.link) ? item.link : undefined;
      const next: Crumb = { label: label || "Untitled", href };
      const newPath = [...path, next];

      if (isValidLink(item?.link) && linkMatchesPath(item.link, pathname)) {
        result = newPath;
        return true;
      }

      if (recurse(item?.submenuItems, newPath)) return true;
    }
    return false;
  };

  if (isValidItemsArray(SidebarData)) {
    for (const section of SidebarData as any[]) {
      const sectionLabel = normalizeLabel(section) || "Menu";
      const sectionPath: Crumb[] = [{ label: sectionLabel }];
      if (recurse(section?.submenuItems, sectionPath)) break;
    }
  }

  return result;
}

/** Fallback: build crumbs from URL segments if sidebar has no match */
function buildCrumbsFromPath(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return [];

  const crumbs: Crumb[] = [];
  let accum = "";
  parts.forEach((seg, idx) => {
    accum += `/${seg}`;
    const label = LABELS[seg] || humanize(seg);
    // Make intermediate segments linkable, last one not
    crumbs.push({ label, href: idx < parts.length - 1 ? accum : undefined });
  });
  return crumbs;
}

const AutoBreadcrumb: React.FC<{ title?: string; onlyHomeAndTitle?: boolean }> = ({
  title,
  onlyHomeAndTitle,
}) => {
  const { pathname } = useLocation();

  const sidebarPath = useMemo(() => findSidebarPath(pathname), [pathname]);

  // Always start with Home
  const homeCrumb: Crumb = {
    label: LABELS[""] || "Home",
    href: pathname !== all_routes.dashboard1 ? all_routes.dashboard1 : undefined,
  };

  let items: Crumb[];

  if (onlyHomeAndTitle) {
    items = [homeCrumb, ...(title ? [{ label: title }] : [])];
  } else {
    if (sidebarPath.length > 0) {
      // Skip the first "section" label (index 0), and don't link the last item
      const trail = sidebarPath.slice(1).map((item, idx, arr) => ({
        label: item.label,
        href: idx < arr.length - 1 ? item.href : undefined,
      }));
      items = [homeCrumb, ...trail];
    } else {
      // Sidebar didn't match: build from the URL itself
      const fallbackTrail = buildCrumbsFromPath(pathname);
      items = [homeCrumb, ...fallbackTrail];
    }
  }

  return <Breadcrumb title={title} items={items} />;
};

export default AutoBreadcrumb;
