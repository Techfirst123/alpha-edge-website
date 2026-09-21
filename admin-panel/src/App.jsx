import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import Layout from "./components/Layout";
import VisitorTracker from "./components/VisitorTracker";
import Home from "./pages/Home";
import About from "./pages/About";
import WhoWeAre from "./pages/WhoWeAre";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import GetQuote from "./pages/GetQuote";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import ProductDetail from "./pages/ProductDetail";
import Reviews from "./pages/Reviews";

// The admin panel is a separate app, loaded only when someone visits /admin
// — public visitors never download it.
const AdminApp = lazy(() => import("./admin/AdminApp"));

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <VisitorTracker />
        <Routes>
          {/* Separate admin panel — own layout, no public navbar/footer. */}
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={null}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/who-we-are" element={<WhoWeAre />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:productId" element={<ProductDetail />} />
                  <Route path="/products/category/:categorySlug" element={<Products />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/get-a-quote" element={<GetQuote />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
