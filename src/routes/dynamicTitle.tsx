import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { publicRoutes, authRoutes } from "./router.link";

type RouteWithMeta = {
  path: string;
  element: React.ReactElement;
  meta_title?: string;
};

const allRoutes: RouteWithMeta[] = [...publicRoutes, ...authRoutes];

export default function DynamicTitle() {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = "Dreams EMR - Responsive Bootstrap 5 Medical Admin Template";
    const current = allRoutes.find((r) => r.path === location.pathname);

    if (current?.meta_title) {
      document.title = current.meta_title.includes(baseTitle)
        ? current.meta_title
        : `${current.meta_title} | ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [location]);

  return null;
}
