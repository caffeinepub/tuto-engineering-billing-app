import { Button } from "@/components/ui/button";
import { Loader2, Printer, RotateCcw, Save } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Address, CompanyHeader, CostRow } from "../backend";
import FabricationCostTable from "../components/FabricationCostTable";
import FinalCalculation from "../components/FinalCalculation";
import InvoiceFooter from "../components/InvoiceFooter";
import InvoiceHeader from "../components/InvoiceHeader";
import MaterialCostTable from "../components/MaterialCostTable";
import { useCreateInvoice } from "../hooks/useQueries";
import type { FabricationRow, MaterialRow } from "../lib/pdfGenerator";
import {
  type InvoiceFormData,
  calcFabricationTotal,
  calcMaterialTotal,
  printInvoice,
} from "../lib/pdfGenerator";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${year}${month}-${rand}`;
}

interface FormState {
  companyName: string;
  companyStreet: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyEmail: string;
  companyGst: string;
  invoiceNumber: string;
  date: string;
  billToName: string;
  billToStreet: string;
  billToCity: string;
  billToState: string;
  billToZip: string;
  billToPhone: string;
  billToEmail: string;
  billToGst: string;
  shippedToName: string;
  shippedToStreet: string;
  shippedToCity: string;
  shippedToState: string;
  shippedToZip: string;
  loadingCharges: number;
  shippingCharges: number;
  advanceAmount: number;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankBranch: string;
  bankGst: string;
  upiNumber: string;
  declaration: string;
  signatureDataUrl: string;
}

const defaultFormState: FormState = {
  companyName: "",
  companyStreet: "",
  companyCity: "",
  companyState: "",
  companyZip: "",
  companyPhone: "",
  companyEmail: "",
  companyGst: "",
  invoiceNumber: generateInvoiceNumber(),
  date: getTodayDate(),
  billToName: "",
  billToStreet: "",
  billToCity: "",
  billToState: "",
  billToZip: "",
  billToPhone: "",
  billToEmail: "",
  billToGst: "",
  shippedToName: "",
  shippedToStreet: "",
  shippedToCity: "",
  shippedToState: "",
  shippedToZip: "",
  loadingCharges: 0,
  shippingCharges: 0,
  advanceAmount: 0,
  accountHolder: "",
  accountNumber: "",
  ifscCode: "",
  bankBranch: "",
  bankGst: "",
  upiNumber: "",
  declaration:
    "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
  signatureDataUrl: "",
};

export default function CreateInvoice() {
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [materialRows, setMaterialRows] = useState<MaterialRow[]>([]);
  const [fabricationRows, setFabricationRows] = useState<FabricationRow[]>([]);

  const createInvoiceMutation = useCreateInvoice();

  const handleFieldChange = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleNumberChange = useCallback((field: string, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSignatureChange = useCallback((dataUrl: string) => {
    setForm((prev) => ({ ...prev, signatureDataUrl: dataUrl }));
  }, []);

  const materialTotal = calcMaterialTotal(materialRows);
  const fabricationTotal = calcFabricationTotal(fabricationRows);

  const buildFormData = (): InvoiceFormData => ({
    ...form,
    materialRows,
    fabricationRows,
  });

  const handleSave = async () => {
    if (!form.billToName.trim()) {
      toast.error('Please enter a client name in "Bill To" section.');
      return;
    }

    const companyHeader: CompanyHeader = {
      name: form.companyName || "Tsuto Engineering",
      address: {
        street: form.companyStreet,
        city: form.companyCity,
        state: form.companyState,
        zip: form.companyZip,
        phone: form.companyPhone,
        email: form.companyEmail,
        gstNumber: form.companyGst,
      },
      bankDetails: {
        accountHolder: form.accountHolder,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        branch: form.bankBranch,
        gstNumber: form.bankGst,
      },
      bankUpi: form.upiNumber,
    };

    const billTo: Address = {
      street:
        form.billToName + (form.billToStreet ? `, ${form.billToStreet}` : ""),
      city: form.billToCity,
      state: form.billToState,
      zip: form.billToZip,
      phone: form.billToPhone,
      email: form.billToEmail,
      gstNumber: form.billToGst,
    };

    const shippedTo: Address = {
      street:
        form.shippedToName +
        (form.shippedToStreet ? `, ${form.shippedToStreet}` : ""),
      city: form.shippedToCity,
      state: form.shippedToState,
      zip: form.shippedToZip,
      phone: "",
      email: "",
      gstNumber: "",
    };

    const materialCosts: CostRow[] = materialRows.map((r) => ({
      description: r.description,
      quantity: BigInt(Math.round(r.quantity)),
      unitPrice: BigInt(Math.round(r.unitPrice)),
      total: BigInt(Math.round(r.quantity * r.unitPrice)),
    }));

    const fabricationCosts: CostRow[] = fabricationRows.map((r) => ({
      description: r.description,
      quantity: BigInt(Math.round(r.quantity)),
      unitPrice: BigInt(Math.round(r.ratePerUnit)),
      total: BigInt(Math.round(r.quantity * r.ratePerUnit)),
    }));

    try {
      const invoiceNum = await createInvoiceMutation.mutateAsync({
        companyHeader,
        billTo,
        shippedTo,
        materialCosts,
        fabricationCosts,
        loadingCharges: BigInt(Math.round(form.loadingCharges)),
        shippingCharges: BigInt(Math.round(form.shippingCharges)),
        advanceAmount: BigInt(Math.round(form.advanceAmount)),
        declaration: form.declaration,
      });
      toast.success(`Invoice saved successfully! Invoice #${invoiceNum}`);
    } catch (_err) {
      toast.error("Failed to save invoice. Please try again.");
    }
  };

  const handlePrint = () => {
    printInvoice(buildFormData());
  };

  const handleClear = () => {
    setForm({
      ...defaultFormState,
      invoiceNumber: generateInvoiceNumber(),
      date: getTodayDate(),
    });
    setMaterialRows([]);
    setFabricationRows([]);
    toast.info("Form cleared.");
  };

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            New Invoice
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fill in the details to create a GST invoice
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Invoice</div>
          <div className="font-mono text-sm font-bold text-primary">
            {form.invoiceNumber}
          </div>
        </div>
      </div>

      {/* Invoice Header */}
      <InvoiceHeader
        companyName={form.companyName}
        companyStreet={form.companyStreet}
        companyCity={form.companyCity}
        companyState={form.companyState}
        companyZip={form.companyZip}
        companyPhone={form.companyPhone}
        companyEmail={form.companyEmail}
        companyGst={form.companyGst}
        invoiceNumber={form.invoiceNumber}
        date={form.date}
        billToName={form.billToName}
        billToStreet={form.billToStreet}
        billToCity={form.billToCity}
        billToState={form.billToState}
        billToZip={form.billToZip}
        billToPhone={form.billToPhone}
        billToEmail={form.billToEmail}
        billToGst={form.billToGst}
        shippedToName={form.shippedToName}
        shippedToStreet={form.shippedToStreet}
        shippedToCity={form.shippedToCity}
        shippedToState={form.shippedToState}
        shippedToZip={form.shippedToZip}
        onChange={handleFieldChange}
      />

      {/* Material Cost Table */}
      <MaterialCostTable rows={materialRows} onChange={setMaterialRows} />

      {/* Fabrication Cost Table */}
      <FabricationCostTable
        rows={fabricationRows}
        onChange={setFabricationRows}
      />

      {/* Final Calculation */}
      <FinalCalculation
        materialTotal={materialTotal}
        fabricationTotal={fabricationTotal}
        loadingCharges={form.loadingCharges}
        shippingCharges={form.shippingCharges}
        advanceAmount={form.advanceAmount}
        onLoadingChange={(val) => handleNumberChange("loadingCharges", val)}
        onShippingChange={(val) => handleNumberChange("shippingCharges", val)}
        onAdvanceChange={(val) => handleNumberChange("advanceAmount", val)}
      />

      {/* Footer */}
      <InvoiceFooter
        accountHolder={form.accountHolder}
        accountNumber={form.accountNumber}
        ifscCode={form.ifscCode}
        bankBranch={form.bankBranch}
        bankGst={form.bankGst}
        upiNumber={form.upiNumber}
        declaration={form.declaration}
        signatureDataUrl={form.signatureDataUrl}
        onChange={handleFieldChange}
        onSignatureChange={handleSignatureChange}
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 pb-4">
        <Button
          onClick={handleSave}
          disabled={createInvoiceMutation.isPending}
          className="col-span-2 sm:col-span-1 h-11 text-sm font-semibold"
        >
          {createInvoiceMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Invoice
            </>
          )}
        </Button>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="h-11 text-sm font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print / PDF
        </Button>
        <Button
          onClick={handleClear}
          variant="outline"
          className="h-11 text-sm font-semibold"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear Form
        </Button>
      </div>
    </div>
  );
}
