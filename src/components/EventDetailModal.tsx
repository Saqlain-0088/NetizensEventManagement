import { useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Download, Share2, Mail, X, Loader2, Edit, ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import type { EventData } from "@/data/mockEvents";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useEvents } from "@/context/EventContext";
import { fmt12 } from "@/lib/utils";

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
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { confirmEvent, cancelEvent } = useEvents();

  // Determine admin status
  const currentRole = roles.find(r => r.id === user?.roleId);
  const isAdmin = !!(currentRole?.permissions.canView && currentRole?.permissions.canAdd &&
    currentRole?.permissions.canEdit && currentRole?.permissions.canDelete);

  // Constants for state check
  const isDraftOrTentative = event?.status === "draft" || event?.status === "tentative";
  const isCancelled = event?.status === "cancelled";
  const isConfirmed = event?.status === "confirmed";

  const handleDownload = useCallback(async () => {
    if (!event) return;
    setDownloading(true);

    try {
      const { default: html2canvas } = await import("html2canvas");

      // 1. Create a hidden container positioned off-screen
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
      `📋 *${event.title}*\n📍 ${event.hallName}\n📅 ${new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}\n⏰ ${fmt12(event.startTime)} – ${fmt12(event.endTime)}\n👥 ${event.pax} guests\n💰 ₹${event.ratePerPerson}/person\nStatus: ${event.status.toUpperCase()}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast({ title: "WhatsApp opened" });
  }, [event, toast]);

  const handleEmail = useCallback(() => {
    if (!event) return;
    const subject = encodeURIComponent(`Event Details: ${event.title}`);
    const body = encodeURIComponent(
      `Event: ${event.title}\nHall: ${event.hallName}\nDate: ${new Date(event.date).toLocaleDateString("en-IN")}\nTime: ${fmt12(event.startTime)} – ${fmt12(event.endTime)}\nGuests: ${event.pax}\nRate: ₹${event.ratePerPerson}/person\nStatus: ${event.status.toUpperCase()}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [event]);

  const handleConfirm = useCallback(async () => {
    if (!event) return;
    const result = await confirmEvent(event.id);
    if (!result.ok) {
      toast({ title: "Cannot Confirm", description: result.error, variant: "destructive" });
    } else {
      // EventContext handles the success toast for Google Calendar sync
      // But we still close the modal
      onClose();
    }
  }, [event, confirmEvent, toast, onClose]);

  const handleReject = useCallback(() => {
    if (!event) return;
    const result = cancelEvent(event.id);
    if (!result.ok) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Cancelled", description: `"${event.title}" has been rejected/cancelled.` });
      onClose();
    }
  }, [event, cancelEvent, toast, onClose]);

  if (!event) return null;

  const isLocked = event.status === "confirmed" && !event.isEditable;
  const canEdit = isAdmin || (event.isEditable && event.status !== "confirmed");
  const canApproveReject = isAdmin && isDraftOrTentative;

  // Scale to fit inside ~800px modal width
  const SCALE = 0.70;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[860px] w-full p-0 overflow-hidden bg-white border-border">
        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <div>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              Event Card Preview
              {isLocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
              {isCancelled && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase">
                  <X className="w-3 h-3" /> Cancelled
                </span>
              )}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enquiry by <span className="font-semibold text-foreground">{event.createdBy}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Admin Actions: Accept / Reject */}
            {canApproveReject && (
              <>
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5 h-8 text-xs border-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 shadow-sm gap-1.5 h-8 text-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Reject
                </Button>
              </>
            )}

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
            
            {canEdit ? (
              <Button
                size="sm"
                onClick={() => navigate(`/edit-enquiry/${event.id}`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-1.5 h-8 text-xs border-0"
              >
                <Edit className="w-3.5 h-3.5" />
                Modify
              </Button>
            ) : (
              <Button
                size="sm"
                disabled
                className="bg-slate-200 text-slate-400 shadow-none gap-1.5 h-8 text-xs border-0 cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" />
                Locked
              </Button>
            )}
            
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
