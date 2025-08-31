import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { publicRoutes, authRoutes } from "./router.link";

type RouteWithMeta = {
  path: string;
  element: React.ReactElement;
  route?: (_props: any) => React.ReactElement | null; // made optional
  meta_title?: string;
  id?: string;
};

const allRoutes: RouteWithMeta[] = [...publicRoutes, ...authRoutes];

export default function DynamicTitle() {
  const location = useLocation();

  useEffect(() => {
    const currentRoute = allRoutes.find(
      (route) => route.path === location.pathname
    );

    const baseTitle =
      "Dreams EMR - Responsive Bootstrap 5 Medical Admin Template";

    if (currentRoute && currentRoute.meta_title) {
      // Avoid duplicating the base title
      if (currentRoute.meta_title.includes(baseTitle)) {
        document.title = currentRoute.meta_title;
      } else {
        document.title = `${currentRoute.meta_title} | ${baseTitle}`;
      }
    } else {
      document.title = baseTitle;
    }
  }, [location]);

  return null;
}
