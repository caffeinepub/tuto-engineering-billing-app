import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronRight,
  Clock,
  FileText,
  IndianRupee,
  LayoutDashboard,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import type { Invoice } from "../backend";
import { InvoiceStatus } from "../backend";
import { useListInvoices } from "../hooks/useQueries";
import { formatCurrency } from "../lib/pdfGenerator";

function getInvoiceTotal(invoice: Invoice): number {
  const matTotal = invoice.materialCosts.reduce(
    (s, r) => s + Number(r.quantity) * Number(r.unitPrice),
    0,
  );
  const fabTotal = invoice.fabricationCosts.reduce(
    (s, r) => s + Number(r.quantity) * Number(r.unitPrice),
    0,
  );
  const sub = matTotal + fabTotal;
  return (
    sub +
    Number(invoice.loadingCharges) +
    Number(invoice.shippingCharges) -
    Number(invoice.advanceAmount)
  );
}

function getClientName(invoice: Invoice): string {
  const street = invoice.billTo.street;
  if (!street) return "Unknown Client";
  const parts = street.split(",");
  return parts[0].trim() || "Unknown Client";
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusColor(
  status: InvoiceStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case InvoiceStatus.paid:
      return "default";
    case InvoiceStatus.cancelled:
      return "destructive";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: InvoiceStatus): string {
  switch (status) {
    case InvoiceStatus.paid:
      return "Paid";
    case InvoiceStatus.cancelled:
      return "Cancelled";
    default:
      return "Pending";
  }
}

function MetricCardSkeleton() {
  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-3 w-20 mt-2" />
      </CardContent>
    </Card>
  );
}

function RecentInvoiceSkeleton() {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: invoices, isLoading, isError } = useListInvoices();

  // Compute metrics
  const totalInvoices = invoices?.length ?? 0;
  const totalRevenue =
    invoices?.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0) ?? 0;
  const totalOutstanding =
    invoices
      ?.filter(
        (inv) =>
          inv.status !== InvoiceStatus.paid &&
          inv.status !== InvoiceStatus.cancelled,
      )
      .reduce((sum, inv) => sum + getInvoiceTotal(inv), 0) ?? 0;

  // 5 most recent invoices (already sorted newest-first by useListInvoices)
  const recentInvoices = invoices?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            Dashboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Overview of your billing activity
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate({ to: "/create" })}
          className="h-8 text-xs"
        >
          <PlusCircle className="w-3.5 h-3.5 mr-1" />
          New Invoice
        </Button>
      </div>

      {/* Error State */}
      {isError && (
        <Card className="shadow-card border-destructive/30">
          <CardContent className="p-4 flex items-center gap-3 text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Failed to load dashboard data. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            {/* Total Invoices */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Invoices
                  </p>
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold font-heading text-foreground">
                  {totalInvoices}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalInvoices === 1
                    ? "1 invoice created"
                    : `${totalInvoices} invoices created`}
                </p>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </p>
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-heading text-primary leading-tight">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all invoices
                </p>
              </CardContent>
            </Card>

            {/* Total Outstanding */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Outstanding
                  </p>
                  <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-warning" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-heading text-warning leading-tight">
                  {formatCurrency(totalOutstanding)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pending payment
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Invoices Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-base text-foreground flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            Recent Invoices
          </h3>
          {!isLoading && totalInvoices > 5 && (
            <Link
              to="/invoices"
              className="text-xs text-primary hover:underline font-medium"
            >
              View all →
            </Link>
          )}
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <RecentInvoiceSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && totalInvoices === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1">
                No invoices yet
              </h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                Start billing your clients by creating your first invoice. It
                only takes a minute!
              </p>
              <Button onClick={() => navigate({ to: "/create" })}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Invoice Cards */}
        {!isLoading && !isError && recentInvoices.length > 0 && (
          <div className="space-y-3">
            {recentInvoices.map((invoice) => {
              const total = getInvoiceTotal(invoice);
              const clientName = getClientName(invoice);
              return (
                <Card
                  key={invoice.invoiceNumber.toString()}
                  className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer active:scale-[0.99]"
                  onClick={() =>
                    navigate({
                      to: "/invoice/$invoiceNumber",
                      params: {
                        invoiceNumber: invoice.invoiceNumber.toString(),
                      },
                    })
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-semibold text-primary">
                              #{invoice.invoiceNumber.toString()}
                            </span>
                            <Badge
                              variant={getStatusColor(invoice.status)}
                              className="text-[10px] h-4 px-1.5"
                            >
                              {getStatusLabel(invoice.status)}
                            </Badge>
                          </div>
                          <p className="font-semibold text-sm text-foreground mt-0.5 truncate">
                            {clientName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(invoice.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <p className="font-bold text-sm text-primary">
                            {formatCurrency(total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.materialCosts.length +
                              invoice.fabricationCosts.length}{" "}
                            items
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
