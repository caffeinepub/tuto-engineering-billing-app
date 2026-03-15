import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import {
  calcFinalTotal,
  calcSubTotal,
  formatCurrency,
} from "../lib/pdfGenerator";

interface FinalCalculationProps {
  materialTotal: number;
  fabricationTotal: number;
  loadingCharges: number;
  shippingCharges: number;
  advanceAmount: number;
  onLoadingChange: (val: number) => void;
  onShippingChange: (val: number) => void;
  onAdvanceChange: (val: number) => void;
}

export default function FinalCalculation({
  materialTotal,
  fabricationTotal,
  loadingCharges,
  shippingCharges,
  advanceAmount,
  onLoadingChange,
  onShippingChange,
  onAdvanceChange,
}: FinalCalculationProps) {
  const subTotal = calcSubTotal(materialTotal, fabricationTotal);
  const finalTotal = calcFinalTotal(
    subTotal,
    loadingCharges,
    shippingCharges,
    advanceAmount,
  );

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-heading flex items-center gap-2 text-primary">
          <Calculator className="w-4 h-4" />
          Final Calculation
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="max-w-sm ml-auto space-y-2">
          {/* Sub Total */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Material Cost</span>
            <span className="text-sm font-medium">
              {formatCurrency(materialTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">
              Fabrication Cost
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(fabricationTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b-2 border-primary/30">
            <span className="text-sm font-semibold">Sub Total</span>
            <span className="text-sm font-bold text-primary">
              {formatCurrency(subTotal)}
            </span>
          </div>

          {/* Editable Charges */}
          <div className="flex items-center justify-between gap-3 py-1">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">
              Loading Charges
            </Label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">₹</span>
              <Input
                type="number"
                min="0"
                value={loadingCharges || ""}
                onChange={(e) =>
                  onLoadingChange(Number.parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className="h-8 text-sm text-right w-28"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 py-1">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">
              Shipping Charges
            </Label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">₹</span>
              <Input
                type="number"
                min="0"
                value={shippingCharges || ""}
                onChange={(e) =>
                  onShippingChange(Number.parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className="h-8 text-sm text-right w-28"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 py-1 border-b border-border">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">
              Advance Paid (−)
            </Label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">₹</span>
              <Input
                type="number"
                min="0"
                value={advanceAmount || ""}
                onChange={(e) =>
                  onAdvanceChange(Number.parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className="h-8 text-sm text-right w-28"
              />
            </div>
          </div>

          {/* Final Total */}
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
  );
}
