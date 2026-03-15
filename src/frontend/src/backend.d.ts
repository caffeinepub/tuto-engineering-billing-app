import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CompanyHeader {
    bankDetails: {
        branch: string;
        ifscCode: string;
        gstNumber: string;
        accountNumber: string;
        accountHolder: string;
    };
    name: string;
    bankUpi: string;
    address: Address;
}
export interface Invoice {
    status: InvoiceStatus;
    materialCosts: Array<CostRow>;
    date: Time;
    declaration: string;
    invoiceNumber: bigint;
    advanceAmount: bigint;
    shippedTo: Address;
    loadingCharges: bigint;
    companyHeader: CompanyHeader;
    shippingCharges: bigint;
    billTo: Address;
    fabricationCosts: Array<CostRow>;
}
export type Time = bigint;
export interface CostRow {
    total: bigint;
    description: string;
    quantity: bigint;
    unitPrice: bigint;
}
export interface Address {
    zip: string;
    street: string;
    gstNumber: string;
    city: string;
    email: string;
    state: string;
    phone: string;
}
export enum InvoiceStatus {
    cancelled = "cancelled",
    pending = "pending",
    paid = "paid"
}
export interface backendInterface {
    createInvoice(companyHeader: CompanyHeader, billTo: Address, shippedTo: Address, materialCosts: Array<CostRow>, fabricationCosts: Array<CostRow>, loadingCharges: bigint, shippingCharges: bigint, advanceAmount: bigint, declaration: string): Promise<bigint>;
    deleteInvoice(invoiceNumber: bigint): Promise<void>;
    getInvoice(invoiceNumber: bigint): Promise<Invoice>;
    listInvoices(): Promise<Array<Invoice>>;
    updateInvoice(invoiceNumber: bigint, invoiceData: Invoice): Promise<void>;
}
