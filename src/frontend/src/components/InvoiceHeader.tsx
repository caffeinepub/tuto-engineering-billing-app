import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, FileText } from "lucide-react";

interface InvoiceHeaderProps {
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
  onChange: (field: string, value: string) => void;
}

export default function InvoiceHeader({
  companyName,
  companyStreet,
  companyCity,
  companyState,
  companyZip,
  companyPhone,
  companyEmail,
  companyGst,
  invoiceNumber,
  date,
  billToName,
  billToStreet,
  billToCity,
  billToState,
  billToZip,
  billToPhone,
  billToEmail,
  billToGst,
  shippedToName,
  shippedToStreet,
  shippedToCity,
  shippedToState,
  shippedToZip,
  onChange,
}: InvoiceHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Company Info */}
      <Card className="shadow-card">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm font-heading flex items-center gap-2 text-primary">
            <Building2 className="w-4 h-4" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">
              Company Name *
            </Label>
            <Input
              value={companyName}
              onChange={(e) => onChange("companyName", e.target.value)}
              placeholder="Tsuto Engineering Pvt. Ltd."
              className="mt-1 h-9 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Street / Address
              </Label>
              <Input
                value={companyStreet}
                onChange={(e) => onChange("companyStreet", e.target.value)}
                placeholder="123 Industrial Area"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                City
              </Label>
              <Input
                value={companyCity}
                onChange={(e) => onChange("companyCity", e.target.value)}
                placeholder="Chennai"
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                State
              </Label>
              <Input
                value={companyState}
                onChange={(e) => onChange("companyState", e.target.value)}
                placeholder="Tamil Nadu"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                PIN Code
              </Label>
              <Input
                value={companyZip}
                onChange={(e) => onChange("companyZip", e.target.value)}
                placeholder="600001"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Phone
              </Label>
              <Input
                value={companyPhone}
                onChange={(e) => onChange("companyPhone", e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Email
              </Label>
              <Input
                type="email"
                value={companyEmail}
                onChange={(e) => onChange("companyEmail", e.target.value)}
                placeholder="info@tsuto.com"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                GST / License No.
              </Label>
              <Input
                value={companyGst}
                onChange={(e) => onChange("companyGst", e.target.value)}
                placeholder="22AAAAA0000A1Z5"
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Metadata */}
      <Card className="shadow-card">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm font-heading flex items-center gap-2 text-primary">
            <FileText className="w-4 h-4" />
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Invoice Number
              </Label>
              <Input
                value={invoiceNumber}
                readOnly
                className="mt-1 h-9 text-sm bg-accent font-mono font-semibold text-primary"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Date
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => onChange("date", e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
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
          <CardContent className="px-4 pb-4 space-y-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Client Name *
              </Label>
              <Input
                value={billToName}
                onChange={(e) => onChange("billToName", e.target.value)}
                placeholder="Client / Company Name"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Street
              </Label>
              <Input
                value={billToStreet}
                onChange={(e) => onChange("billToStreet", e.target.value)}
                placeholder="Street address"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  City
                </Label>
                <Input
                  value={billToCity}
                  onChange={(e) => onChange("billToCity", e.target.value)}
                  placeholder="City"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  State
                </Label>
                <Input
                  value={billToState}
                  onChange={(e) => onChange("billToState", e.target.value)}
                  placeholder="State"
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  PIN
                </Label>
                <Input
                  value={billToZip}
                  onChange={(e) => onChange("billToZip", e.target.value)}
                  placeholder="PIN Code"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Phone
                </Label>
                <Input
                  value={billToPhone}
                  onChange={(e) => onChange("billToPhone", e.target.value)}
                  placeholder="Phone"
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Email
              </Label>
              <Input
                type="email"
                value={billToEmail}
                onChange={(e) => onChange("billToEmail", e.target.value)}
                placeholder="client@email.com"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                GST Number
              </Label>
              <Input
                value={billToGst}
                onChange={(e) => onChange("billToGst", e.target.value)}
                placeholder="GST Number"
                className="mt-1 h-9 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-heading text-primary">
              Shipped To
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Recipient Name
              </Label>
              <Input
                value={shippedToName}
                onChange={(e) => onChange("shippedToName", e.target.value)}
                placeholder="Recipient / Site Name"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Street
              </Label>
              <Input
                value={shippedToStreet}
                onChange={(e) => onChange("shippedToStreet", e.target.value)}
                placeholder="Street address"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  City
                </Label>
                <Input
                  value={shippedToCity}
                  onChange={(e) => onChange("shippedToCity", e.target.value)}
                  placeholder="City"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  State
                </Label>
                <Input
                  value={shippedToState}
                  onChange={(e) => onChange("shippedToState", e.target.value)}
                  placeholder="State"
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                PIN Code
              </Label>
              <Input
                value={shippedToZip}
                onChange={(e) => onChange("shippedToZip", e.target.value)}
                placeholder="PIN Code"
                className="mt-1 h-9 text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
