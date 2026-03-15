import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronRight,
  FileText,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Invoice } from "../backend";
import { InvoiceStatus } from "../backend";
import { useDeleteInvoice, useListInvoices } from "../hooks/useQueries";
import { formatCurrency } from "../lib/pdfGenerator";

function getStatusColor(status: InvoiceStatus) {
  switch (status) {
    case InvoiceStatus.paid:
      return "default";
    case InvoiceStatus.cancelled:
      return "destructive";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: InvoiceStatus) {
  switch (status) {
    case InvoiceStatus.paid:
      return "Paid";
    case InvoiceStatus.cancelled:
      return "Cancelled";
    default:
      return "Pending";
  }
}

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

export default function InvoiceHistory() {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const navigate = useNavigate();
  const { data: invoices, isLoading, isError } = useListInvoices();
  const deleteMutation = useDeleteInvoice();

  const filtered = (invoices || []).filter((inv) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const clientName = getClientName(inv).toLowerCase();
    const invNum = inv.invoiceNumber.toString();
    return clientName.includes(q) || invNum.includes(q);
  });

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(BigInt(deleteTarget.invoiceNumber), {
      onSettled: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            Invoice History
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {invoices
              ? `${invoices.length} invoice${invoices.length !== 1 ? "s" : ""} saved`
              : "Loading..."}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate({ to: "/create" })}
          className="h-8 text-xs"
          data-ocid="invoice_history.new_invoice.button"
        >
          <PlusCircle className="w-3.5 h-3.5 mr-1" />
          New
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client name or invoice number..."
          className="pl-9 h-10 text-sm"
          data-ocid="invoice_history.search_input"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3" data-ocid="invoice_history.loading_state">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <Card
          className="shadow-card border-destructive/30"
          data-ocid="invoice_history.error_state"
        >
          <CardContent className="p-4 flex items-center gap-3 text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Failed to load invoices. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="invoice_history.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading font-semibold text-foreground mb-1">
            {search ? "No results found" : "No invoices yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search
              ? "Try a different search term."
              : "Create your first invoice to get started."}
          </p>
          {!search && (
            <Button onClick={() => navigate({ to: "/create" })} size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          )}
        </div>
      )}

      {/* Invoice List */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((invoice, idx) => {
            const total = getInvoiceTotal(invoice);
            const clientName = getClientName(invoice);
            return (
              <Card
                key={invoice.invoiceNumber.toString()}
                className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer active:scale-[0.99]"
                onClick={() =>
                  navigate({
                    to: "/invoice/$invoiceNumber",
                    params: { invoiceNumber: invoice.invoiceNumber.toString() },
                  })
                }
                data-ocid={`invoice_history.item.${idx + 1}`}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(invoice);
                        }}
                        data-ocid={`invoice_history.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="invoice_history.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Are you sure you want to delete invoice{" "}
                  <span className="font-semibold text-foreground">
                    #{deleteTarget.invoiceNumber.toString()}
                  </span>{" "}
                  for{" "}
                  <span className="font-semibold text-foreground">
                    {getClientName(deleteTarget)}
                  </span>
                  ?
                  <br />
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="invoice_history.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              data-ocid="invoice_history.delete.confirm_button"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
