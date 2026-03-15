import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

actor {
  type Address = {
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
    phone : Text;
    email : Text;
    gstNumber : Text;
  };

  type CompanyHeader = {
    name : Text;
    address : Address;
    bankDetails : {
      accountHolder : Text;
      ifscCode : Text;
      gstNumber : Text;
      accountNumber : Text;
      branch : Text;
    };
    bankUpi : Text;
  };

  type CostRow = {
    description : Text;
    quantity : Nat;
    unitPrice : Nat;
    total : Nat;
  };

  type InvoiceStatus = { #pending; #paid; #cancelled };

  type Invoice = {
    invoiceNumber : Nat;
    date : Time.Time;
    companyHeader : CompanyHeader;
    billTo : Address;
    shippedTo : Address;
    materialCosts : [CostRow];
    fabricationCosts : [CostRow];
    loadingCharges : Nat;
    shippingCharges : Nat;
    advanceAmount : Nat;
    declaration : Text;
    status : InvoiceStatus;
  };

  module Invoice {
    public func compare(invoice1 : Invoice, invoice2 : Invoice) : Order.Order {
      Nat.compare(invoice1.invoiceNumber, invoice2.invoiceNumber);
    };
  };

  let invoices = Map.empty<Nat, Invoice>();
  var nextInvoiceNumber = 1;

  public shared ({ caller }) func createInvoice(
    companyHeader : CompanyHeader,
    billTo : Address,
    shippedTo : Address,
    materialCosts : [CostRow],
    fabricationCosts : [CostRow],
    loadingCharges : Nat,
    shippingCharges : Nat,
    advanceAmount : Nat,
    declaration : Text,
  ) : async Nat {
    let invoiceNumber = nextInvoiceNumber;
    let invoice : Invoice = {
      invoiceNumber;
      date = Time.now();
      companyHeader;
      billTo;
      shippedTo;
      materialCosts;
      fabricationCosts;
      loadingCharges;
      shippingCharges;
      advanceAmount;
      declaration;
      status = #pending;
    };
    invoices.add(invoiceNumber, invoice);
    nextInvoiceNumber += 1;
    invoiceNumber;
  };

  public query ({ caller }) func getInvoice(invoiceNumber : Nat) : async Invoice {
    switch (invoices.get(invoiceNumber)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) { invoice };
    };
  };

  public query ({ caller }) func listInvoices() : async [Invoice] {
    invoices.values().toArray().sort();
  };

  public shared ({ caller }) func updateInvoice(invoiceNumber : Nat, invoiceData : Invoice) : async () {
    if (not invoices.containsKey(invoiceNumber)) {
      Runtime.trap("Invoice not found");
    };
    invoices.add(invoiceNumber, invoiceData);
  };

  public shared ({ caller }) func deleteInvoice(invoiceNumber : Nat) : async () {
    if (not invoices.containsKey(invoiceNumber)) {
      Runtime.trap("Invoice not found");
    };
    invoices.remove(invoiceNumber);
  };
};
