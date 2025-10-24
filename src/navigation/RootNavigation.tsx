import React, { useEffect, useState, useRef, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Admin from "src/pages/admin";

import CalculatorFeatures from "src/pages/calculator";
import { LoadingScreen } from "src/shared/components/loading";

// Sử dụng React.lazy để tải lười biếng các trang
const About = React.lazy(() => import("src/pages/about"));
const Accessory = React.lazy(() => import("src/pages/accessory"));
const ContactUs = React.lazy(() => import("src/pages/contact"));
const ErrorPage = React.lazy(() => import("src/pages/error"));
const Faqs = React.lazy(() => import("src/pages/faq"));
const Home = React.lazy(() => import("src/pages/home"));
const Login = React.lazy(() => import("src/pages/login"));
const AuthCallback = React.lazy(() => import("src/pages/auth/callback"));
const MembershipPlans = React.lazy(() => import("src/pages/premium"));
const Services = React.lazy(() => import("src/pages/servicesfeatures"));
const Shop = React.lazy(() => import("src/pages/shop"));
const TermAndConditions = React.lazy(() => import("src/pages/term"));
const AdminDashboard = React.lazy(
  () => import("src/pages/admin/dashboard/AdminDashboard")
);
const Blog = React.lazy(() => import("src/pages/blog"));
const BlogLastPost = React.lazy(
  () => import("src/pages/blog/blogPagesBranches/BlogLastPost")
);
const BlogPreviousPost = React.lazy(
  () => import("src/pages/blog/blogPagesBranches/BlogPreviousPost")
);
const BlogDetails = React.lazy(
  () => import("src/pages/blog/blogPagesBranches/BlogDetails")
);
const ListingAll = React.lazy(() => import("src/pages/listings/index"));
const ListingDetails = React.lazy(
  () => import("src/pages/listings/item/ListingDetails")
);
const ListingCarOld = React.lazy(
  () => import("src/pages/listings/item/ListingCarOld")
);
const ListingBody = React.lazy(
  () => import("src/pages/listings/item/ListingBody")
);
export function RootNavigation() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const prevLocation = useRef(location);

  useEffect(() => {
    const isHome = location.pathname === "/home";
    const wasHome = prevLocation.current.pathname === "/home";

    if (isHome || wasHome) {
      setLoading(true);
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 750);
      return () => clearTimeout(timeout);
    }

    prevLocation.current = location;
  }, [location]);

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <Suspense fallback={<LoadingScreen />}>
          <Routes location={location}>
            <Route element={<Home />} path="/home" />
            <Route element={<Home />} path="/" />
            <Route element={<About />} path="/about" />
            <Route element={<CalculatorFeatures />} path="/home/calculator" />
            <Route element={<Login />} path="/auth/login" />
            <Route element={<AuthCallback />} path="/auth/callback" />
            <Route element={<AuthCallback />} path="/auth/callback/google" />
            <Route element={<ContactUs />} path="/contact" />
            <Route element={<ErrorPage />} path="*" />
            <Route element={<Services />} path="/home/services" />
            <Route element={<Shop />} path="/home/shop" />
            <Route element={<Faqs />} path="/pages/faqs" />
            <Route element={<MembershipPlans />} path="/home/premium" />
            <Route element={<Accessory />} path="/home/accessory" />
            <Route
              element={<TermAndConditions />}
              path="/pages/term_&_condition"
            />
            <Route element={<TermAndConditions />} path="/pages/privacy" />
            <Route element={<Admin />} path="/login/admin" />
            <Route
              element={<AdminDashboard />}
              path="/auth/login/admin/page_manage"
            />
            <Route element={<Blog />} path="/home/blog/all_blogs" />
            <Route element={<BlogLastPost />} path="/home/blog/last_post" />
            <Route
              element={<BlogPreviousPost />}
              path="/home/blog/previous_post"
            />
            <Route
              element={<BlogDetails />}
              path="/home/blog/all_blogs/details"
            />
            <Route element={<ListingAll />} path="/listings/all" />
            <Route element={<ListingDetails />} path="/listings/details" />
            <Route element={<ListingDetails />} path="/cars/details" />
            <Route element={<ListingCarOld />} path="/listings/car_old" />
            <Route element={<ListingBody />} path="/listings/body" />
          </Routes>
        </Suspense>
      )}
    </>
  );
}
