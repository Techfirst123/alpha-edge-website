import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Loading, ToastProvider } from "./ui";
import AdminLayout from "./AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import Overview from "./pages/Overview";
import Enquiries from "./pages/Enquiries";
import HeroSlides from "./pages/HeroSlides";
import HomeContent from "./pages/HomeContent";
import SupplyCategories from "./pages/SupplyCategories";
import ExpertisePhotos from "./pages/ExpertisePhotos";
import Services from "./pages/Services";
import AboutTeam from "./pages/AboutTeam";
import WhoWeAre from "./pages/WhoWeAre";
import Products from "./pages/Products";
import Reviews from "./pages/Reviews";
import Visitors from "./pages/Visitors";
import SiteSettings from "./pages/SiteSettings";
import AdminUsers from "./pages/AdminUsers";
import "./admin.css";

// The admin panel is its own app under /admin — no public navbar/footer and
// no editing on the public pages. Everything here reads and writes MongoDB
// through /api/admin/*, and the public site simply reads that data back.
function RequireAdmin({ children }) {
  const { isAdmin, ready } = useAdminAuth();
  const location = useLocation();
  if (!ready) {
    return (
      <div className="adm-boot">
        <Loading label="Checking your session…" />
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
}

function SuperOnly({ children }) {
  const { isSuperAdmin } = useAdminAuth();
  return isSuperAdmin ? children : <Navigate to="/admin" replace />;
}

export default function AdminApp() {
  return (
    <ToastProvider>
      <div className="adm-root">
        <Routes>
          <Route path="login" element={<AdminLogin />} />
          <Route
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Overview />} />
            {/* old bookmark */}
            <Route path="dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="hero" element={<HeroSlides />} />
            <Route path="homepage" element={<HomeContent />} />
            <Route path="supply" element={<SupplyCategories />} />
            <Route path="expertise" element={<ExpertisePhotos />} />
            <Route path="services" element={<Services />} />
            <Route path="about" element={<AboutTeam />} />
            <Route path="who-we-are" element={<WhoWeAre />} />
            <Route path="products" element={<Products />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route
              path="users"
              element={
                <SuperOnly>
                  <AdminUsers />
                </SuperOnly>
              }
            />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </div>
    </ToastProvider>
  );
}
