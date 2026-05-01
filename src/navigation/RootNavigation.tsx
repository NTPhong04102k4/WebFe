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
import { ErrorBoundary } from "src/shared/components/ErrorBoundary";
import { storage } from "src/services/storage";

import CalculatorFeatures from "src/pages/calculator";
import { LoadingScreen } from "src/shared/components/loading";
import { Header } from "src/shared/components/header";
import { FooterComponent } from "src/shared/components/footer";
import { Theme } from "src/shared/components/footer/data";
import { useAppSelector } from "src/redux/hook";
import { selectIsAuthenticated } from "src/redux/Slice/AuthSlice";
import { RequireAuth } from "src/components/routing/RequireAuth";
import { StaffRoute } from "src/components/routing/StaffRoute";
import { getTokenClaims } from "src/services/decode";

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
  () => import("src/pages/admin/dashboard/AdminDashboard"),
);
const ListingAll = React.lazy(() => import("src/pages/listings/index"));
const ListingDetails = React.lazy(
  () => import("src/pages/listings/item/ListingDetails"),
);
const ListingCarOld = React.lazy(
  () => import("src/pages/listings/item/ListingCarOld"),
);
const ListingBody = React.lazy(
  () => import("src/pages/listings/item/ListingBody"),
);
const PaymentForm = React.lazy(
  () => import("src/components/payment/PaymentForm"),
);
const AccountLayout = React.lazy(() => import("src/pages/account/AccountLayout"));
const GaragePage = React.lazy(
  () => import("src/pages/account/garage/GaragePage"),
);
const AppointmentsPage = React.lazy(
  () => import("src/pages/account/appointments/AppointmentsPage"),
);
const WorkOrdersPage = React.lazy(
  () => import("src/pages/account/work-orders/WorkOrdersPage"),
);
const MyInsurancePage = React.lazy(
  () => import("src/pages/account/insurance/MyInsurancePage"),
);
const StaffLayout = React.lazy(() => import("src/pages/staff/StaffLayout"));
const StaffWorkshopPanel = React.lazy(() =>
  import("src/pages/staff/panels/StaffWorkshopPanel").then((m) => ({
    default: m.StaffWorkshopPanel,
  })),
);
const StaffInsurancePanel = React.lazy(() =>
  import("src/pages/staff/panels/StaffInsurancePanel").then((m) => ({
    default: m.StaffInsurancePanel,
  })),
);
const Profile = React.lazy(() => import("src/pages/profile/UserProfileForm"));
const AccessoryEditorPage = React.lazy(
  () =>
    import("src/pages/admin/dashboard/ItemDashboard/mainDashBoard/Accessories/EditAccessories/AccessoryEditorPage"),
);
const ServiceFormPage = React.lazy(
  () =>
    import("src/pages/admin/dashboard/ItemDashboard/mainDashBoard/ServiecsManagement/ServiceForm"),
);
export function RootNavigation() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const prevLocation = useRef(location);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

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
  const token = storage.getToken();
  const isSuperAdmin = getTokenClaims(token)
    ?.sub?.toLowerCase()
    .includes("superadmin");

  useEffect(() => {
    const isAdminArea = location.pathname.startsWith("/auth/login/admin");

    if (!isAuthenticated && isAdminArea) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!isAuthenticated) return;

    if (!isSuperAdmin && isAdminArea) {
      navigate("/home", { replace: true });
      return;
    }

    if (isSuperAdmin && !isAdminArea) {
      navigate("/auth/login/admin/page_manage", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const shouldHideHeader = useMemo(() => {
    return (
      location.pathname.startsWith("/auth/login/admin") ||
      location.pathname.startsWith("/staff") ||
      location.pathname === "/home" ||
      location.pathname === "/"
    );
  }, [location.pathname]);

  const shouldHideFooter = useMemo(() => {
    return (
      location.pathname.startsWith("/auth/login/admin") ||
      location.pathname.startsWith("/staff")
    );
  }, [location.pathname]);

  const footerTheme = useMemo(() => {
    const lightThemeRoutes = ["/home", "/"];
    return lightThemeRoutes.includes(location.pathname)
      ? Theme.LIGHT
      : Theme.DARK;
  }, [location.pathname]);

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
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <Routes location={location}>
                <Route element={<Home />} path="/home" />
                <Route
                  element={
                    isAuthenticated && isSuperAdmin ? (
                      <Navigate to="/auth/login/admin/page_manage" replace />
                    ) : (
                      <Home />
                    )
                  }
                  path="/"
                />
                <Route element={<About />} path="/about" />
                <Route
                  element={<CalculatorFeatures />}
                  path="/home/calculator"
                />
                <Route element={<Login />} path="/auth/login" />
                <Route element={<Login />} path="/auth/signin" />
                <Route element={<Login />} path="/auth/signUp" />
                <Route element={<AuthCallback />} path="/auth/callback" />
                <Route
                  element={<AuthCallback />}
                  path="/auth/callback/google"
                />
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
                    ) : !isSuperAdmin ? (
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
                    ) : !isSuperAdmin ? (
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
                    ) : !isSuperAdmin ? (
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
                    ) : !isSuperAdmin ? (
                      <Navigate to="/home" replace />
                    ) : (
                      <AccessoryEditorPage />
                    )
                  }
                  path="/auth/login/admin/accessories/new"
                />
                <Route
                  element={
                    !isAuthenticated ? (
                      <Navigate to="/auth/login" replace />
                    ) : !isSuperAdmin ? (
                      <Navigate to="/home" replace />
                    ) : (
                      <ServiceFormPage />
                    )
                  }
                  path="/auth/login/admin/services/edit/:id"
                />
                <Route
                  element={
                    !isAuthenticated ? (
                      <Navigate to="/auth/login" replace />
                    ) : !isSuperAdmin ? (
                      <Navigate to="/home" replace />
                    ) : (
                      <ServiceFormPage />
                    )
                  }
                  path="/auth/login/admin/services/new"
                />

                <Route element={<ListingAll />} path="/listings/all" />
                <Route element={<ListingDetails />} path="/listings/details" />
                <Route element={<ListingDetails />} path="/cars/details" />
                <Route element={<ListingCarOld />} path="/listings/car_old" />
                <Route element={<ListingBody />} path="/listings/body" />
                <Route path="/payment" element={<PaymentForm />} />

                <Route
                  path="/account"
                  element={
                    <RequireAuth>
                      <AccountLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="/account/garage" replace />} />
                  <Route path="garage" element={<GaragePage />} />
                  <Route path="appointments" element={<AppointmentsPage />} />
                  <Route path="work-orders" element={<WorkOrdersPage />} />
                  <Route path="insurance" element={<MyInsurancePage />} />
                </Route>

                <Route
                  path="/staff"
                  element={
                    <StaffRoute>
                      <StaffLayout />
                    </StaffRoute>
                  }
                >
                  <Route
                    index
                    element={<Navigate to="/staff/workshop" replace />}
                  />
                  <Route path="workshop" element={<StaffWorkshopPanel />} />
                  <Route path="insurance" element={<StaffInsurancePanel />} />
                </Route>
                {/* <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/error" element={<PaymentError />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} /> */}
              </Routes>
            </Suspense>
          </ErrorBoundary>
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
