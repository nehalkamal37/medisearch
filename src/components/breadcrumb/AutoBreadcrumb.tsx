import React from "react";
import { useLocation } from "react-router-dom";
import Breadcrumb from "./breadcrumb";
import { all_routes } from "../../routes/all_routes";
import { SidebarData } from "../sidebar/sidebarData";

// Mapping اختيارية لأسماء السجمنتس
const LABELS: Record<string, string> = {
  "": "Home",
  "base-ui": "Base UI",
  "accordions": "Accordions",
};

type Crumb = { label: string; href?: string };

function findSidebarPath(pathname: string) {
  let result: Crumb[] = [];

  function recurse(items: any[], path: Crumb[]): boolean {
    for (const item of items) {
      const next: Crumb = { label: item.label, href: item.link !== "#" ? item.link : undefined };
      const newPath = [...path, next];

      // تطابق كامل مع الرابط
      if (item.link && item.link !== "#" && item.link === pathname) {
        result = newPath;
        return true;
      }
      if (item.submenuItems && item.submenuItems.length > 0) {
        if (recurse(item.submenuItems, newPath)) return true;
      }
    }
    return false;
  }

  for (const section of SidebarData) {
    if (recurse(section.submenuItems, [{ label: section.tittle }])) break; // tittle موجودة عندك في الـdata
  }
  return result;
}

const AutoBreadcrumb: React.FC<{ title?: string; onlyHomeAndTitle?: boolean }> = ({
  title,
  onlyHomeAndTitle,
}) => {
  const { pathname } = useLocation();
  const sidebarPath = findSidebarPath(pathname);

  let items: Crumb[];

  if (onlyHomeAndTitle) {
    items = [
      {
        label: LABELS[""] || "Home",
        href: pathname !== all_routes.dashboard ? all_routes.dashboard : undefined,
      },
      ...(title ? [{ label: title }] : []),
    ];
  } else {
    // Home دايمًا أول عنصر
    items = [
      {
        label: LABELS[""] || "Home",
        href: pathname !== all_routes.dashboard ? all_routes.dashboard : undefined,
      },
      // تخطي عنوان السكشن الأول (tittle) لو مش عايزه يظهر
      ...sidebarPath.slice(1).map((item, idx) => ({
        label: item.label,
        href: idx < sidebarPath.length - 2 ? item.href : undefined,
      })),
    ];
  }

  return <Breadcrumb title={title} items={items} />;
};

export default AutoBreadcrumb;
