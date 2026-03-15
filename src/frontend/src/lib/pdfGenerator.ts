import type { Invoice } from "../backend";

export interface InvoiceFormData {
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
  materialRows: MaterialRow[];
  fabricationRows: FabricationRow[];
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

export interface MaterialRow {
  id: string;
  description: string;
  quantity: number;
  unitWeight: number;
  unitPrice: number;
}

export interface FabricationRow {
  id: string;
  description: string;
  quantity: number;
  ratePerUnit: number;
}

export function calcMaterialAmount(row: MaterialRow): number {
  return row.quantity * row.unitPrice;
}

export function calcFabricationAmount(row: FabricationRow): number {
  return row.quantity * row.ratePerUnit;
}

export function calcMaterialTotal(rows: MaterialRow[]): number {
  return rows.reduce((sum, r) => sum + calcMaterialAmount(r), 0);
}

export function calcFabricationTotal(rows: FabricationRow[]): number {
  return rows.reduce((sum, r) => sum + calcFabricationAmount(r), 0);
}

export function calcSubTotal(
  materialTotal: number,
  fabricationTotal: number,
): number {
  return materialTotal + fabricationTotal;
}

export function calcFinalTotal(
  subTotal: number,
  loading: number,
  shipping: number,
  advance: number,
): number {
  return subTotal + loading + shipping - advance;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generatePrintHTML(data: InvoiceFormData): string {
  const materialTotal = calcMaterialTotal(data.materialRows);
  const fabricationTotal = calcFabricationTotal(data.fabricationRows);
  const subTotal = calcSubTotal(materialTotal, fabricationTotal);
  const finalTotal = calcFinalTotal(
    subTotal,
    data.loadingCharges,
    data.shippingCharges,
    data.advanceAmount,
  );

  const materialRowsHTML = data.materialRows
    .map(
      (row, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f0fdfa"}">
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:center">${i + 1}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0">${row.description || "-"}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:center">${row.quantity}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:center">${row.unitWeight || "-"}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right">${formatCurrency(row.unitPrice)}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:600">${formatCurrency(calcMaterialAmount(row))}</td>
    </tr>`,
    )
    .join("");

  const fabricationRowsHTML = data.fabricationRows
    .map(
      (row, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f0fdfa"}">
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:center">${i + 1}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0">${row.description || "-"}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:center">${row.quantity}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right">${formatCurrency(row.ratePerUnit)}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:600">${formatCurrency(calcFabricationAmount(row))}</td>
    </tr>`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice #${data.invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1a202c; background: white; }
    .page { max-width: 800px; margin: 0 auto; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 3px solid #0d9488; padding-bottom: 16px; }
    .company-name { font-size: 22px; font-weight: 700; color: #0d9488; }
    .invoice-title { font-size: 28px; font-weight: 700; color: #0d9488; text-align: right; }
    .invoice-meta { text-align: right; margin-top: 4px; }
    .section-title { background: #0d9488; color: white; padding: 6px 10px; font-weight: 600; font-size: 12px; margin: 16px 0 0 0; }
    .bill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 12px 0; }
    .bill-box { border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; }
    .bill-box-title { font-weight: 700; color: #0d9488; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 0; }
    th { background: #0d9488; color: white; padding: 7px 8px; text-align: left; font-size: 11px; border: 1px solid #0d9488; }
    th.right { text-align: right; }
    th.center { text-align: center; }
    .totals-table { margin-top: 12px; }
    .totals-table td { padding: 5px 8px; border: 1px solid #e2e8f0; }
    .totals-table .label { font-weight: 600; }
    .totals-table .amount { text-align: right; }
    .final-total { background: #0d9488; color: white; font-weight: 700; font-size: 14px; }
    .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
    .footer-box { border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; }
    .footer-box-title { font-weight: 700; color: #0d9488; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; }
    .signature-box { border: 1px dashed #cbd5e0; min-height: 80px; display: flex; align-items: center; justify-content: center; margin-top: 8px; }
    .declaration { font-size: 10px; color: #718096; margin-top: 8px; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div>
      <div class="company-name">${data.companyName || "TUTO Engineering"}</div>
      <div style="margin-top:4px;color:#4a5568;line-height:1.5">
        ${data.companyStreet ? `${data.companyStreet}<br/>` : ""}
        ${data.companyCity ? `${data.companyCity + (data.companyState ? `, ${data.companyState}` : "") + (data.companyZip ? ` - ${data.companyZip}` : "")}<br/>` : ""}
        ${data.companyPhone ? `Ph: ${data.companyPhone}<br/>` : ""}
        ${data.companyEmail ? `Email: ${data.companyEmail}<br/>` : ""}
        ${data.companyGst ? `GST: ${data.companyGst}` : ""}
      </div>
    </div>
    <div>
      <div class="invoice-title">TAX INVOICE</div>
      <div class="invoice-meta">
        <div><strong>Invoice #:</strong> ${data.invoiceNumber}</div>
        <div><strong>Date:</strong> ${data.date}</div>
      </div>
    </div>
  </div>

  <!-- Bill To / Shipped To -->
  <div class="bill-grid">
    <div class="bill-box">
      <div class="bill-box-title">Bill To</div>
      <div style="line-height:1.6">
        <strong>${data.billToName || "-"}</strong><br/>
        ${data.billToStreet ? `${data.billToStreet}<br/>` : ""}
        ${data.billToCity ? `${data.billToCity + (data.billToState ? `, ${data.billToState}` : "")}<br/>` : ""}
        ${data.billToPhone ? `Ph: ${data.billToPhone}<br/>` : ""}
        ${data.billToEmail ? `Email: ${data.billToEmail}<br/>` : ""}
        ${data.billToGst ? `GST: ${data.billToGst}` : ""}
      </div>
    </div>
    <div class="bill-box">
      <div class="bill-box-title">Shipped To</div>
      <div style="line-height:1.6">
        <strong>${data.shippedToName || "-"}</strong><br/>
        ${data.shippedToStreet ? `${data.shippedToStreet}<br/>` : ""}
        ${data.shippedToCity ? `${data.shippedToCity + (data.shippedToState ? `, ${data.shippedToState}` : "")}<br/>` : ""}
      </div>
    </div>
  </div>

  <!-- Material Costs -->
  ${
    data.materialRows.length > 0
      ? `
  <div class="section-title">MATERIAL COSTS</div>
  <table>
    <thead>
      <tr>
        <th class="center" style="width:40px">Sl.No</th>
        <th>Description</th>
        <th class="center" style="width:60px">Qty</th>
        <th class="center" style="width:70px">Unit Wt.</th>
        <th class="right" style="width:90px">Unit Price</th>
        <th class="right" style="width:90px">Amount</th>
      </tr>
    </thead>
    <tbody>${materialRowsHTML}</tbody>
    <tfoot>
      <tr>
        <td colspan="5" style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:700">Total Material Cost</td>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:700;color:#0d9488">${formatCurrency(materialTotal)}</td>
      </tr>
    </tfoot>
  </table>`
      : ""
  }

  <!-- Fabrication Costs -->
  ${
    data.fabricationRows.length > 0
      ? `
  <div class="section-title">FABRICATION COSTS</div>
  <table>
    <thead>
      <tr>
        <th class="center" style="width:40px">Sl.No</th>
        <th>Description</th>
        <th class="center" style="width:60px">Qty</th>
        <th class="right" style="width:100px">Rate/Unit</th>
        <th class="right" style="width:90px">Amount</th>
      </tr>
    </thead>
    <tbody>${fabricationRowsHTML}</tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:700">Total Fabrication Cost</td>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:700;color:#0d9488">${formatCurrency(fabricationTotal)}</td>
      </tr>
    </tfoot>
  </table>`
      : ""
  }

  <!-- Final Calculation -->
  <div class="section-title">FINAL CALCULATION</div>
  <table class="totals-table" style="max-width:320px;margin-left:auto;margin-top:12px">
    <tr><td class="label">Sub Total</td><td class="amount">${formatCurrency(subTotal)}</td></tr>
    <tr><td class="label">Loading Charges</td><td class="amount">+ ${formatCurrency(data.loadingCharges)}</td></tr>
    <tr><td class="label">Shipping Charges</td><td class="amount">+ ${formatCurrency(data.shippingCharges)}</td></tr>
    <tr><td class="label">Advance Paid</td><td class="amount">- ${formatCurrency(data.advanceAmount)}</td></tr>
    <tr class="final-total"><td class="label" style="padding:8px">FINAL TOTAL</td><td class="amount" style="padding:8px">${formatCurrency(finalTotal)}</td></tr>
  </table>

  <!-- Footer -->
  <div class="footer-grid">
    <div class="footer-box">
      <div class="footer-box-title">Bank Details</div>
      <div style="line-height:1.8">
        ${data.accountHolder ? `<div><strong>Account Name:</strong> ${data.accountHolder}</div>` : ""}
        ${data.accountNumber ? `<div><strong>Account No:</strong> ${data.accountNumber}</div>` : ""}
        ${data.ifscCode ? `<div><strong>IFSC:</strong> ${data.ifscCode}</div>` : ""}
        ${data.bankBranch ? `<div><strong>Branch:</strong> ${data.bankBranch}</div>` : ""}
        ${data.upiNumber ? `<div><strong>UPI:</strong> ${data.upiNumber}</div>` : ""}
      </div>
    </div>
    <div class="footer-box">
      <div class="footer-box-title">Authorized Signature</div>
      <div class="signature-box">
        ${data.signatureDataUrl ? `<img src="${data.signatureDataUrl}" style="max-height:70px;max-width:100%" alt="Signature"/>` : '<span style="color:#a0aec0;font-size:11px">Authorized Signatory</span>'}
      </div>
      <div style="text-align:center;margin-top:4px;font-size:10px;color:#718096">${data.companyName || "Company Name"}</div>
    </div>
  </div>

  ${data.declaration ? `<div class="declaration"><strong>Declaration:</strong> ${data.declaration}</div>` : ""}
</div>
</body>
</html>`;
}

export function printInvoice(data: InvoiceFormData): void {
  const html = generatePrintHTML(data);
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("Please allow popups to print/download the invoice.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

export function invoiceToFormData(invoice: Invoice): Partial<InvoiceFormData> {
  const date = new Date(Number(invoice.date) / 1_000_000);
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
    date: date.toLocaleDateString("en-IN"),
    billToName: invoice.billTo.street,
    billToStreet: invoice.billTo.street,
    billToCity: invoice.billTo.city,
    billToState: invoice.billTo.state,
    billToZip: invoice.billTo.zip,
    billToPhone: invoice.billTo.phone,
    billToEmail: invoice.billTo.email,
    billToGst: invoice.billTo.gstNumber,
    shippedToName: invoice.shippedTo.street,
    shippedToStreet: invoice.shippedTo.street,
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
  };
}
