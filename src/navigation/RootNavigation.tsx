import React, { useEffect, useState, useRef, Suspense, useMemo } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Admin from "src/pages/admin";
import styled from "styled-components";

import CalculatorFeatures from "src/pages/calculator";
import { LoadingScreen } from "src/shared/components/loading";
import { Header } from "src/shared/components/header";
import { FooterComponent } from "src/shared/components/footer";
import { Theme } from "src/shared/components/footer/data";
import { useAppDispatch, useAppSelector } from "src/redux/hook";
import {
  selectIsAuthenticated,
  selectUser,
  clearCredentials,
} from "src/redux/Slice/AuthSlice";

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
const PaymentForm = React.lazy(
  () => import("src/components/payment/PaymentForm")
);
const Profile = React.lazy(() => import("src/pages/profile/UserProfileForm"));
const AccessoryEditorPage = React.lazy(
  () =>
    import(
      "src/pages/admin/dashboard/ItemDashboard/mainDashBoard/Accessories/EditAccessories/AccessoryEditorPage"
    )
);
export function RootNavigation() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const prevLocation = useRef(location);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const roles: string[] = useMemo(() => {
    const r =
      (user as any)?.roles ||
      (user as any)?.authorities ||
      ((user as any)?.role ? [(user as any)?.role] : []);
    return Array.isArray(r) ? r.map((x) => String(x).toLowerCase()) : [];
  }, [user]);

  // Handle unauthorized errors from API interceptor
  useEffect(() => {
    const handleUnauthorized = (event: CustomEvent) => {
      // Clear credentials
      dispatch(clearCredentials());
      // Navigate to login page without reload
      const currentPath = location.pathname;
      if (
        currentPath !== "/auth/login" &&
        currentPath !== "/login" &&
        currentPath !== "/auth/signin" &&
        currentPath !== "/auth/signUp"
      ) {
        navigate("/auth/login", { replace: true });
      }
    };

    window.addEventListener(
      "auth:unauthorized",
      handleUnauthorized as EventListener
    );

    return () => {
      window.removeEventListener(
        "auth:unauthorized",
        handleUnauthorized as EventListener
      );
    };
  }, [dispatch, navigate, location.pathname]);

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

  // Role-based navigation enforcement
  useEffect(() => {
    const isAdminLoginPage = location.pathname === "/login/admin";
    const isAdminArea = location.pathname.startsWith("/auth/login/admin");

    // Block unauthenticated users from admin routes
    if (!isAuthenticated && isAdminArea) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!isAuthenticated) return;
    const isCustomer = roles.includes("customer");

    // Customers cannot access admin routes
    if (isCustomer && (isAdminArea || isAdminLoginPage)) {
      navigate("/home", { replace: true });
      return;
    }

    // Non-customers (e.g., admin/staff) are locked to admin area
    if (!isCustomer && !isAdminArea && !isAdminLoginPage) {
      navigate("/auth/login/admin/page_manage", { replace: true });
    }
  }, [isAuthenticated, roles, location.pathname, navigate]);

  // Determine if Header should be hidden for specific routes
  const shouldHideHeader = useMemo(() => {
    return (
      location.pathname === "/login/admin" ||
      location.pathname.startsWith("/auth/login/admin") ||
      location.pathname === "/home" ||
      location.pathname === "/"
    );
  }, [location.pathname]);

  // Determine if Footer should be hidden for specific routes (only admin pages)
  const shouldHideFooter = useMemo(() => {
    return (
      location.pathname === "/login/admin" ||
      location.pathname.startsWith("/auth/login/admin")
    );
  }, [location.pathname]);

  // Determine footer theme based on route
  const footerTheme = useMemo(() => {
    const lightThemeRoutes = ["/home", "/"];
    return lightThemeRoutes.includes(location.pathname)
      ? Theme.LIGHT
      : Theme.DARK;
  }, [location.pathname]);

  // Determine if footer should show newsletter section
  const showFooterNewsletter = useMemo(() => {
    const hideNewsletterRoutes = ["/home", "/"];
    return !hideNewsletterRoutes.includes(location.pathname);
  }, [location.pathname]);

  return (
    <LayoutContainer>
      {!shouldHideHeader && <Header />}
      <ContentWrapper>
        {loading ? (
          <LoadingScreen />
        ) : (
          <Suspense fallback={<LoadingScreen />}>
            <Routes location={location}>
              <Route element={<Home />} path="/home" />
              <Route
                element={
                  isAuthenticated && !roles.includes("customer") ? (
                    <Navigate to="/auth/login/admin/page_manage" replace />
                  ) : (
                    <Home />
                  )
                }
                path="/"
              />
              <Route element={<About />} path="/about" />
              <Route element={<CalculatorFeatures />} path="/home/calculator" />
              <Route element={<Login />} path="/auth/login" />
              <Route element={<Login />} path="/auth/signin" />
              <Route element={<Login />} path="/auth/signUp" />
              <Route element={<AuthCallback />} path="/auth/callback" />
              <Route element={<AuthCallback />} path="/auth/callback/google" />
              <Route
                element={<AuthCallback />}
                path="/auth/callback/facebook"
              />
              <Route element={<ContactUs />} path="/contact" />
              <Route element={<Profile />} path="/profile" />
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
              <Route
                element={
                  !isAuthenticated ? (
                    <Admin />
                  ) : roles.includes("customer") ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <Navigate to="/auth/login/admin/page_manage" replace />
                  )
                }
                path="/login/admin"
              />
              <Route
                element={
                  !isAuthenticated ? (
                    <Navigate to="/auth/login" replace />
                  ) : roles.includes("customer") ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <AdminDashboard />
                  )
                }
                path="/auth/login/admin/page_manage"
              />
              <Route
                element={
                  !isAuthenticated ? (
                    <Navigate to="/auth/login" replace />
                  ) : roles.includes("customer") ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <AccessoryEditorPage />
                  )
                }
                path="/auth/login/admin/accessories/edit/:id"
              />
              <Route
                element={
                  !isAuthenticated ? (
                    <Navigate to="/auth/login" replace />
                  ) : roles.includes("customer") ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <AccessoryEditorPage />
                  )
                }
                path="/auth/login/admin/accessories/new"
              />

              <Route element={<ListingAll />} path="/listings/all" />
              <Route element={<ListingDetails />} path="/listings/details" />
              <Route element={<ListingDetails />} path="/cars/details" />
              <Route element={<ListingCarOld />} path="/listings/car_old" />
              <Route element={<ListingBody />} path="/listings/body" />
              <Route path="/payment" element={<PaymentForm />} />
              {/* <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/error" element={<PaymentError />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} /> */}
            </Routes>
          </Suspense>
        )}
      </ContentWrapper>
      {!shouldHideFooter && (
        <FooterComponent theme={footerTheme} show={showFooterNewsletter} />
      )}
    </LayoutContainer>
  );
}

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
`;
