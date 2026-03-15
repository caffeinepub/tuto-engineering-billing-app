import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calculator,
  FileText,
  Landmark,
  Package,
  Printer,
  Wrench,
} from "lucide-react";
import { InvoiceStatus } from "../backend";
import type { Invoice } from "../backend";
import { useGetInvoice } from "../hooks/useQueries";
import {
  type InvoiceFormData,
  formatCurrency,
  printInvoice,
} from "../lib/pdfGenerator";

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatusVariant(
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

function getClientName(invoice: Invoice): string {
  const street = invoice.billTo.street;
  if (!street) return "Unknown Client";
  const parts = street.split(",");
  return parts[0].trim() || "Unknown Client";
}

function invoiceToFormData(invoice: Invoice): InvoiceFormData {
  const clientName = getClientName(invoice);
  const billToStreet = invoice.billTo.street.includes(",")
    ? invoice.billTo.street.split(",").slice(1).join(",").trim()
    : "";
  const shippedToName = invoice.shippedTo.street.includes(",")
    ? invoice.shippedTo.street.split(",")[0].trim()
    : invoice.shippedTo.street;
  const shippedToStreet = invoice.shippedTo.street.includes(",")
    ? invoice.shippedTo.street.split(",").slice(1).join(",").trim()
    : "";

  return {
    companyName: invoice.companyHeader.name,
    companyStreet: invoice.companyHeader.address.street,
    companyCity: invoice.companyHeader.address.city,
    companyState: invoice.companyHeader.address.state,
    companyZip: invoice.companyHeader.address.zip,
    companyPhone: invoice.companyHeader.address.phone,
    companyEmail: invoice.companyHeader.address.email,
    companyGst: invoice.companyHeader.address.gstNumber,
    invoiceNumber: invoice.invoiceNumber.toString(),
    date: formatDate(invoice.date),
    billToName: clientName,
    billToStreet,
    billToCity: invoice.billTo.city,
    billToState: invoice.billTo.state,
    billToZip: invoice.billTo.zip,
    billToPhone: invoice.billTo.phone,
    billToEmail: invoice.billTo.email,
    billToGst: invoice.billTo.gstNumber,
    shippedToName,
    shippedToStreet,
    shippedToCity: invoice.shippedTo.city,
    shippedToState: invoice.shippedTo.state,
    shippedToZip: invoice.shippedTo.zip,
    materialRows: invoice.materialCosts.map((r, i) => ({
      id: String(i),
      description: r.description,
      quantity: Number(r.quantity),
      unitWeight: 0,
      unitPrice: Number(r.unitPrice),
    })),
    fabricationRows: invoice.fabricationCosts.map((r, i) => ({
      id: String(i),
      description: r.description,
      quantity: Number(r.quantity),
      ratePerUnit: Number(r.unitPrice),
    })),
    loadingCharges: Number(invoice.loadingCharges),
    shippingCharges: Number(invoice.shippingCharges),
    advanceAmount: Number(invoice.advanceAmount),
    accountHolder: invoice.companyHeader.bankDetails.accountHolder,
    accountNumber: invoice.companyHeader.bankDetails.accountNumber,
    ifscCode: invoice.companyHeader.bankDetails.ifscCode,
    bankBranch: invoice.companyHeader.bankDetails.branch,
    bankGst: invoice.companyHeader.bankDetails.gstNumber,
    upiNumber: invoice.companyHeader.bankUpi,
    declaration: invoice.declaration,
    signatureDataUrl: "",
  };
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
      <span className="text-xs text-muted-foreground min-w-[120px]">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function InvoiceDetail() {
  const { invoiceNumber } = useParams({ from: "/invoice/$invoiceNumber" });
  const navigate = useNavigate();

  let invoiceNum: bigint;
  try {
    invoiceNum = BigInt(invoiceNumber);
  } catch {
    invoiceNum = BigInt(0);
  }

  const { data: invoice, isLoading, isError } = useGetInvoice(invoiceNum);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-card">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/invoices" })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to History
        </Button>
        <Card className="shadow-card border-destructive/30">
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="font-semibold text-foreground">Invoice not found</p>
            <p className="text-sm text-muted-foreground">
              This invoice may have been deleted or does not exist.
            </p>
            <Button size="sm" onClick={() => navigate({ to: "/invoices" })}>
              Go to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const matTotal = invoice.materialCosts.reduce(
    (s, r) => s + Number(r.quantity) * Number(r.unitPrice),
    0,
  );
  const fabTotal = invoice.fabricationCosts.reduce(
    (s, r) => s + Number(r.quantity) * Number(r.unitPrice),
    0,
  );
  const subTotal = matTotal + fabTotal;
  const finalTotal =
    subTotal +
    Number(invoice.loadingCharges) +
    Number(invoice.shippingCharges) -
    Number(invoice.advanceAmount);

  const clientName = getClientName(invoice);

  const handlePrint = () => {
    printInvoice(invoiceToFormData(invoice));
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/invoices" })}
            className="h-8 px-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-primary">
                #{invoice.invoiceNumber.toString()}
              </span>
              <Badge
                variant={getStatusVariant(invoice.status)}
                className="text-[10px] h-4 px-1.5"
              >
                {getStatusLabel(invoice.status)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(invoice.date)}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrint}
          className="h-8 text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Printer className="w-3.5 h-3.5 mr-1" />
          Print / PDF
        </Button>
      </div>

      {/* Company & Invoice Info */}
      <Card className="shadow-card">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-heading flex items-center gap-2 text-primary">
            <Building2 className="w-4 h-4" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-1.5">
          <InfoRow label="Company Name" value={invoice.companyHeader.name} />
          <InfoRow
            label="Address"
            value={invoice.companyHeader.address.street}
          />
          <InfoRow
            label="City / State"
            value={[
              invoice.companyHeader.address.city,
              invoice.companyHeader.address.state,
            ]
              .filter(Boolean)
              .join(", ")}
          />
          <InfoRow label="PIN Code" value={invoice.companyHeader.address.zip} />
          <InfoRow label="Phone" value={invoice.companyHeader.address.phone} />
          <InfoRow label="Email" value={invoice.companyHeader.address.email} />
          <InfoRow
            label="GST Number"
            value={invoice.companyHeader.address.gstNumber}
          />
        </CardContent>
      </Card>

      {/* Bill To / Shipped To */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-heading text-primary">
              Bill To
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-1.5">
            <p className="font-semibold text-sm text-foreground">
              {clientName}
            </p>
            {invoice.billTo.street && (
              <p className="text-xs text-muted-foreground">
                {invoice.billTo.street}
              </p>
            )}
            {(invoice.billTo.city || invoice.billTo.state) && (
              <p className="text-xs text-muted-foreground">
                {[invoice.billTo.city, invoice.billTo.state]
                  .filter(Boolean)
                  .join(", ")}
                {invoice.billTo.zip ? ` - ${invoice.billTo.zip}` : ""}
              </p>
            )}
            {invoice.billTo.phone && (
              <p className="text-xs text-muted-foreground">
                Ph: {invoice.billTo.phone}
              </p>
            )}
            {invoice.billTo.email && (
              <p className="text-xs text-muted-foreground">
                {invoice.billTo.email}
              </p>
            )}
            {invoice.billTo.gstNumber && (
              <p className="text-xs text-muted-foreground">
                GST: {invoice.billTo.gstNumber}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-heading text-primary">
              Shipped To
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-1.5">
            {invoice.shippedTo.street && (
              <p className="text-sm text-foreground">
                {invoice.shippedTo.street}
              </p>
            )}
            {(invoice.shippedTo.city || invoice.shippedTo.state) && (
              <p className="text-xs text-muted-foreground">
                {[invoice.shippedTo.city, invoice.shippedTo.state]
                  .filter(Boolean)
                  .join(", ")}
                {invoice.shippedTo.zip ? ` - ${invoice.shippedTo.zip}` : ""}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Material Costs */}
      {invoice.materialCosts.length > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-heading flex items-center gap-2 text-primary">
              <Package className="w-4 h-4" />
              Material Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="table-header-bg">
                    <th className="px-3 py-2 text-center font-semibold w-10">
                      #
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Description
                    </th>
                    <th className="px-3 py-2 text-center font-semibold w-16">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-right font-semibold w-28">
                      Unit Price
                    </th>
                    <th className="px-3 py-2 text-right font-semibold w-28">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.materialCosts.map((row, i) => {
                    const amount = Number(row.quantity) * Number(row.unitPrice);
                    return (
                      <tr
                        key={`mat-${i}-${row.description}`}
                        className={i % 2 === 0 ? "bg-card" : "table-row-alt"}
                      >
                        <td className="px-3 py-2 text-center text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-3 py-2">{row.description || "-"}</td>
                        <td className="px-3 py-2 text-center">
                          {Number(row.quantity)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(Number(row.unitPrice))}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">
                          {formatCurrency(amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-2">
              {invoice.materialCosts.map((row, i) => {
                const amount = Number(row.quantity) * Number(row.unitPrice);
                return (
                  <div
                    key={`mat-${i}-${row.description}`}
                    className="border border-border rounded-md p-3 bg-card"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          #{i + 1}
                        </span>
                        <p className="text-sm font-medium mt-0.5">
                          {row.description || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Qty: {Number(row.quantity)} ×{" "}
                          {formatCurrency(Number(row.unitPrice))}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex justify-end">
              <div className="bg-accent rounded-md px-4 py-2 flex items-center gap-3">
                <span className="text-xs font-semibold text-accent-foreground">
                  Total Material Cost:
                </span>
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(matTotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fabrication Costs */}
      {invoice.fabricationCosts.length > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-heading flex items-center gap-2 text-primary">
              <Wrench className="w-4 h-4" />
              Fabrication Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="table-header-bg">
                    <th className="px-3 py-2 text-center font-semibold w-10">
                      #
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Description
                    </th>
                    <th className="px-3 py-2 text-center font-semibold w-16">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-right font-semibold w-28">
                      Rate / Unit
                    </th>
                    <th className="px-3 py-2 text-right font-semibold w-28">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.fabricationCosts.map((row, i) => {
                    const amount = Number(row.quantity) * Number(row.unitPrice);
                    return (
                      <tr
                        key={`fab-${i}-${row.description}`}
                        className={i % 2 === 0 ? "bg-card" : "table-row-alt"}
                      >
                        <td className="px-3 py-2 text-center text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-3 py-2">{row.description || "-"}</td>
                        <td className="px-3 py-2 text-center">
                          {Number(row.quantity)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(Number(row.unitPrice))}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">
                          {formatCurrency(amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-2">
              {invoice.fabricationCosts.map((row, i) => {
                const amount = Number(row.quantity) * Number(row.unitPrice);
                return (
                  <div
                    key={`fab-${i}-${row.description}`}
                    className="border border-border rounded-md p-3 bg-card"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          #{i + 1}
                        </span>
                        <p className="text-sm font-medium mt-0.5">
                          {row.description || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Qty: {Number(row.quantity)} ×{" "}
                          {formatCurrency(Number(row.unitPrice))}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex justify-end">
              <div className="bg-accent rounded-md px-4 py-2 flex items-center gap-3">
                <span className="text-xs font-semibold text-accent-foreground">
                  Total Fabrication Cost:
                </span>
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(fabTotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Calculation */}
      <Card className="shadow-card">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-heading flex items-center gap-2 text-primary">
            <Calculator className="w-4 h-4" />
            Final Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="max-w-sm ml-auto space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Material Cost
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(matTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Fabrication Cost
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(fabTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b-2 border-primary/30">
              <span className="text-sm font-semibold">Sub Total</span>
              <span className="text-sm font-bold text-primary">
                {formatCurrency(subTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">
                Loading Charges
              </span>
              <span className="text-sm font-medium">
                + {formatCurrency(Number(invoice.loadingCharges))}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">
                Shipping Charges
              </span>
              <span className="text-sm font-medium">
                + {formatCurrency(Number(invoice.shippingCharges))}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Advance Paid
              </span>
              <span className="text-sm font-medium text-destructive">
                − {formatCurrency(Number(invoice.advanceAmount))}
              </span>
            </div>
            <div className="bg-primary rounded-lg px-4 py-3 flex items-center justify-between mt-2">
              <span className="text-primary-foreground font-bold text-base">
                FINAL TOTAL
              </span>
              <span className="text-primary-foreground font-bold text-xl">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      {(invoice.companyHeader.bankDetails.accountHolder ||
        invoice.companyHeader.bankDetails.accountNumber ||
        invoice.companyHeader.bankUpi) && (
        <Card className="shadow-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-heading flex items-center gap-2 text-primary">
              <Landmark className="w-4 h-4" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-1.5">
            <InfoRow
              label="Account Holder"
              value={invoice.companyHeader.bankDetails.accountHolder}
            />
            <InfoRow
              label="Account Number"
              value={invoice.companyHeader.bankDetails.accountNumber}
            />
            <InfoRow
              label="IFSC Code"
              value={invoice.companyHeader.bankDetails.ifscCode}
            />
            <InfoRow
              label="Branch"
              value={invoice.companyHeader.bankDetails.branch}
            />
            <InfoRow label="UPI" value={invoice.companyHeader.bankUpi} />
          </CardContent>
        </Card>
      )}

      {/* Declaration */}
      {invoice.declaration && (
        <Card className="shadow-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-heading flex items-center gap-2 text-primary">
              <FileText className="w-4 h-4" />
              Declaration
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {invoice.declaration}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bottom Print Button */}
      <div className="pb-4">
        <Button
          onClick={handlePrint}
          className="w-full h-11 text-sm font-semibold"
          variant="outline"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print / Download as PDF
        </Button>
      </div>
    </div>
  );
}
