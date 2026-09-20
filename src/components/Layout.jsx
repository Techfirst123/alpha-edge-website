import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";
import { getSiteSettings } from "../api/client";
import { placeholderSiteSettings } from "../data/placeholder";

export default function Layout({ children }) {
  const [settings, setSettings] = useState(placeholderSiteSettings);

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .catch(() => setSettings(placeholderSiteSettings));
  }, []);

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer settings={settings} />
      <CookieConsent />
    </>
  );
}
