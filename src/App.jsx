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
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import ProductDetail from "./pages/ProductDetail";
import Reviews from "./pages/Reviews";

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <VisitorTracker />
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          {/* No Navbar/Footer here — the dashboard is its own admin-only screen. */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
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
