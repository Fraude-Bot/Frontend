import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "@presentation/App.css";
import { DependencyProvider } from "@presentation/providers/DependencyProvider";
import { APP_ROUTES } from "@/common/app-routes";

const Home = lazy(() => import("@presentation/pages/home/Home"));
const Contact = lazy(() => import("@presentation/pages/contact/Contact"));
const Search = lazy(() => import("@presentation/pages/search/Search"));
const NotFound = lazy(() => import("@presentation/pages/404/NotFound"));
const Report = lazy(() => import("@presentation/pages/report/Report"));
const ReportForm = lazy(() => import("@presentation/pages/report-form/ReportForm"));

function RouteLoadingFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-live="polite"
    >
      Cargando página…
    </div>
  );
}

function App() {
  return (
    <DependencyProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path={APP_ROUTES.home} element={<Home />} />
            <Route path={APP_ROUTES.contact} element={<Contact />} />
            <Route path={APP_ROUTES.search} element={<Search />} />
            <Route path={APP_ROUTES.report} element={<ReportForm />} />
            <Route
              path={APP_ROUTES.organization}
              element={<Report type="organization" />}
            />
            <Route
              path={APP_ROUTES.scammer}
              element={<Report type="scammer" />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </DependencyProvider>
  );
}

export default App;
