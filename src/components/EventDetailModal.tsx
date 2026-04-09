import { useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Mail, X, Loader2 } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import type { EventData } from "@/data/mockEvents";
import { useToast } from "@/hooks/use-toast";

interface EventDetailModalProps {
  event: EventData | null;
  open: boolean;
  onClose: () => void;
}

export const EventDetailModal = ({ event, open, onClose }: EventDetailModalProps) => {
  // This ref is on the PREVIEW card (scaled). We do NOT capture this.
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = useCallback(async () => {
    if (!event) return;
    setDownloading(true);

    try {
      const { default: html2canvas } = await import("html2canvas");

      // 1. Create a hidden container positioned off-screen (not display:none — html2canvas needs it rendered)
      const container = document.createElement("div");
      container.style.cssText = [
        "position:fixed",
        "top:0",
        "left:-9999px",
        "width:1080px",
        "z-index:-1",
        "pointer-events:none",
        "overflow:visible",
      ].join(";");
      document.body.appendChild(container);

      // 2. Render a fresh EventCard into it via a temporary React root
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(container);

      await new Promise<void>((resolve) => {
        root.render(
          <EventCard
            event={event}
            ref={(el) => {
              if (el) resolve();
            }}
          />
        );
      });

      // Small tick to let the browser paint
      await new Promise((r) => setTimeout(r, 80));

      const cardEl = container.firstElementChild as HTMLElement;

      const canvas = await html2canvas(cardEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#F8F7FF",
        logging: false,
        width: 1080,
        windowWidth: 1080,
        scrollX: 0,
        scrollY: 0,
      });

      // 3. Clean up
      root.unmount();
      document.body.removeChild(container);

      // 4. Trigger download
      const link = document.createElement("a");
      link.download = `${event.title.replace(/\s+/g, "_")}_event_card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({ title: "Downloaded!", description: "Event card saved as PNG." });
    } catch (err) {
      console.error(err);
      toast({ title: "Download failed", description: "Could not generate the image.", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  }, [event, toast]);

  const handleWhatsApp = useCallback(() => {
    if (!event) return;
    const text = encodeURIComponent(
      `📋 *${event.title}*\n📍 ${event.hallName}\n📅 ${new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}\n⏰ ${event.startTime} – ${event.endTime}\n👥 ${event.pax} guests\n💰 ₹${event.ratePerPerson}/person\nStatus: ${event.status.toUpperCase()}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast({ title: "WhatsApp opened" });
  }, [event, toast]);

  const handleEmail = useCallback(() => {
    if (!event) return;
    const subject = encodeURIComponent(`Event Details: ${event.title}`);
    const body = encodeURIComponent(
      `Event: ${event.title}\nHall: ${event.hallName}\nDate: ${new Date(event.date).toLocaleDateString("en-IN")}\nTime: ${event.startTime} – ${event.endTime}\nGuests: ${event.pax}\nRate: ₹${event.ratePerPerson}/person\nStatus: ${event.status.toUpperCase()}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [event]);

  if (!event) return null;

  // Scale to fit inside ~800px modal width
  const SCALE = 0.70;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[860px] w-full p-0 overflow-hidden bg-white border-border">
        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <div>
            <DialogTitle className="text-base font-bold text-foreground">Event Card Preview</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{event.title}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="gradient-primary text-white border-0 shadow-sm hover:opacity-90 gap-1.5 h-8 text-xs"
            >
              {downloading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
                : <><Download className="w-3.5 h-3.5" /> Download PNG</>
              }
            </Button>
            <Button size="sm" variant="outline" onClick={handleWhatsApp} className="h-8 text-xs gap-1.5 border-border">
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={handleEmail} className="h-8 text-xs gap-1.5 border-border">
              <Mail className="w-3.5 h-3.5" />
              Email
            </Button>
            <button
              onClick={onClose}
              className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable preview ── */}
        <div className="overflow-y-auto bg-slate-100" style={{ maxHeight: "78vh" }}>
          <div className="py-5 px-4 flex justify-center">
            {/*
              Outer div reserves the correct visual space after CSS scale.
              Inner div applies the scale transform — the EventCard inside
              renders at full 1080px width but appears scaled down.
            */}
            <div
              style={{
                width: `${Math.round(1080 * SCALE)}px`,
                height: `${Math.round(1500 * SCALE)}px`,   // generous height so card never clips
                position: "relative",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "1080px",
                  transformOrigin: "top left",
                  transform: `scale(${SCALE})`,
                }}
              >
                {/* previewRef is only for visual — NOT used for capture */}
                <EventCard ref={previewRef} event={event} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
