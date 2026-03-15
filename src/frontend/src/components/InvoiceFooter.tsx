import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eraser, Landmark, PenLine, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface InvoiceFooterProps {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankBranch: string;
  bankGst: string;
  upiNumber: string;
  declaration: string;
  signatureDataUrl: string;
  onChange: (field: string, value: string) => void;
  onSignatureChange: (dataUrl: string) => void;
}

export default function InvoiceFooter({
  accountHolder,
  accountNumber,
  ifscCode,
  bankBranch,
  bankGst,
  upiNumber,
  declaration,
  signatureDataUrl,
  onChange,
  onSignatureChange,
}: InvoiceFooterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = useCallback(
    (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const startDrawing = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      setIsDrawing(true);
      lastPos.current = getPos(e, canvas);
    },
    [getPos],
  );

  const draw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pos = getPos(e, canvas);
      if (lastPos.current) {
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = "#1a202c";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }
      lastPos.current = pos;
    },
    [isDrawing, getPos],
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      onSignatureChange(canvas.toDataURL("image/png"));
    }
  }, [isDrawing, onSignatureChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      onSignatureChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Bank Details */}
      <Card className="shadow-card">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm font-heading flex items-center gap-2 text-primary">
            <Landmark className="w-4 h-4" />
            Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Account Holder Name
              </Label>
              <Input
                value={accountHolder}
                onChange={(e) => onChange("accountHolder", e.target.value)}
                placeholder="Account holder name"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Account Number
              </Label>
              <Input
                value={accountNumber}
                onChange={(e) => onChange("accountNumber", e.target.value)}
                placeholder="Account number"
                className="mt-1 h-9 text-sm font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                IFSC Code
              </Label>
              <Input
                value={ifscCode}
                onChange={(e) =>
                  onChange("ifscCode", e.target.value.toUpperCase())
                }
                placeholder="SBIN0001234"
                className="mt-1 h-9 text-sm font-mono"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Branch
              </Label>
              <Input
                value={bankBranch}
                onChange={(e) => onChange("bankBranch", e.target.value)}
                placeholder="Branch name"
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                UPI Number / ID
              </Label>
              <Input
                value={upiNumber}
                onChange={(e) => onChange("upiNumber", e.target.value)}
                placeholder="name@upi"
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Bank GST Number
              </Label>
              <Input
                value={bankGst}
                onChange={(e) => onChange("bankGst", e.target.value)}
                placeholder="GST Number"
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Declaration & Signature */}
      <Card className="shadow-card">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm font-heading flex items-center gap-2 text-primary">
            <PenLine className="w-4 h-4" />
            Declaration & Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">
              Declaration Text
            </Label>
            <Textarea
              value={declaration}
              onChange={(e) => onChange("declaration", e.target.value)}
              placeholder="We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct."
              className="mt-1 text-sm min-h-[80px] resize-none"
            />
          </div>

          {/* Signature Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Authorized Signature
              </Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={signatureMode === "draw" ? "default" : "outline"}
                  onClick={() => setSignatureMode("draw")}
                  className="h-6 text-xs px-2"
                >
                  <PenLine className="w-3 h-3 mr-1" />
                  Draw
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={signatureMode === "upload" ? "default" : "outline"}
                  onClick={() => setSignatureMode("upload")}
                  className="h-6 text-xs px-2"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
              </div>
            </div>

            {signatureMode === "draw" ? (
              <div className="space-y-2">
                <div className="border-2 border-dashed border-border rounded-md overflow-hidden bg-white">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={150}
                    className="w-full h-[120px] cursor-crosshair touch-none"
                    style={{ display: "block" }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Draw your signature above
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={clearSignature}
                    className="h-6 text-xs px-2"
                  >
                    <Eraser className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-accent/50 transition-colors">
                  {signatureDataUrl ? (
                    <img
                      src={signatureDataUrl}
                      alt="Signature"
                      className="max-h-[100px] max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-6 h-6" />
                      <span className="text-xs">
                        Click to upload signature image
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                {signatureDataUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onSignatureChange("")}
                    className="h-6 text-xs px-2"
                  >
                    <Eraser className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
