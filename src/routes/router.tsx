// routes/router.tsx
import { Routes, Route, Navigate } from "react-router-dom"; // <- from react-router-dom
import { authRoutes, publicRoutes } from "./router.link";
import Feature from "../layouts/feature";
import AuthFeature from "../layouts/authFeature";
import LandingPage from "../pages/new/home";

const ALLRoutes: React.FC = () => {
  const firstPublic = publicRoutes[0]?.path || "/login"; // fallback target

  return (
    <Routes>
      {/* redirect "/" to your first public page */}

      <Route path="/" element={<Navigate to={firstPublic} replace />} />
      <Route path="/home" element={<LandingPage />} />
      {/* Public area */}
      <Route element={<Feature />}>
        {publicRoutes.map((route, idx) => (
          <Route key={idx} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* Auth area */}
      <Route element={<AuthFeature />}>
        {authRoutes.map((route, idx) => (
          <Route key={idx} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* 404 */}
      <Route path="*" element={<div style={{ padding: 24 }}>Not Found</div>} />
    </Routes>
  );
};

export default ALLRoutes;
