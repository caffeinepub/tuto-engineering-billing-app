import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import CreateInvoice from "./pages/CreateInvoice";
import Dashboard from "./pages/Dashboard";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoiceHistory from "./pages/InvoiceHistory";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster richColors position="top-right" />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const createInvoiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: CreateInvoice,
});

const invoiceHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoices",
  component: InvoiceHistory,
});

const invoiceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoice/$invoiceNumber",
  component: InvoiceDetail,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  createInvoiceRoute,
  invoiceHistoryRoute,
  invoiceDetailRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
