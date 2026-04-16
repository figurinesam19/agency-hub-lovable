import { useState, useRef, useEffect } from "react";
import {
  Upload,
  CalendarClock,
  Send,
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  X,
  Leaf,
  Home,
  Search,
  PlusSquare,
  Play,
  User,
  ChevronDown,
  Share2,
  ThumbsUp,
  Globe,
  ArrowLeft,
  Music,
  Video,
  Loader2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram } from "lucide-react";

interface MetaConnection {
  platform: string;
  page_id: string | null;
  expires_at: string | null;
}

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
type NetworkKey = "instagram" | "facebook" | "x" | "linkedin" | "tiktok";

interface NetworkConfig {
  key: NetworkKey;
  label: string;
  color: string;
  gradient?: string;
  maxChars: number;
  icon: (active: boolean) => React.ReactNode;
}

// ═══════════════════════════════════════════════════════════
// SVG ICONS — Network Buttons
// ═══════════════════════════════════════════════════════════
function IgIcon(active: boolean) {
  if (active) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="rgba(255,255,255,0.25)" />
        <circle cx="12" cy="12" r="4.2" stroke="white" strokeWidth="1.6" fill="none" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-gr" x1="2" y1="22" x2="22" y2="2">
          <stop stopColor="#feda75" />
          <stop offset=".25" stopColor="#fa7e1e" />
          <stop offset=".5" stopColor="#d62976" />
          <stop offset=".75" stopColor="#962fbf" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-gr)" />
      <circle cx="12" cy="12" r="4.2" stroke="white" strokeWidth="1.6" fill="none" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
    </svg>
  );
}

function FbIcon(active: boolean) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill={active ? "rgba(255,255,255,0.25)" : "#1877F2"} />
      <path
        d="M16.5 15.5l.5-3.5h-3v-2c0-1 .5-1.8 1.8-1.8H17V5.5s-1-.2-2-.2c-2.1 0-3.5 1.3-3.5 3.6V12H8.5v3.5h3V23.8c.6.1 1.2.2 1.8.2s1.2-.1 1.7-.2V15.5h1.5z"
        fill="white"
      />
    </svg>
  );
}

function XIconSvg(active: boolean) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill={active ? "rgba(255,255,255,0.25)" : "#000"} />
      <path
        d="M14.2 10.4L18.5 5.5H17.2L13.6 9.5 10.7 5.5H7L11.5 12.7 7 18H8.3L12.1 13.6 15.2 18H18.9L14.2 10.4ZM12.7 12.8L12.1 12L8.7 6.4H10.3L13.2 10.3L13.8 11.1L17.2 17.2H15.6L12.7 12.8Z"
        fill="white"
      />
    </svg>
  );
}

function LiIcon(active: boolean) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill={active ? "rgba(255,255,255,0.25)" : "#0A66C2"} />
      <path
        d="M8.5 10.5V17M8.5 7.5V7.51M11.5 17V13C11.5 11.5 12.5 10.5 14 10.5C15.5 10.5 16 11.5 16 13V17M11.5 10.5V17"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TkIcon(active: boolean) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill={active ? "rgba(255,255,255,0.25)" : "#010101"} />
      <path
        d="M16.5 8.5C15.3 8.5 14.2 7.9 13.5 7V13.5C13.5 15.7 11.7 17.5 9.5 17.5C7.3 17.5 5.5 15.7 5.5 13.5C5.5 11.3 7.3 9.5 9.5 9.5C9.7 9.5 9.9 9.5 10 9.5V11.5C9.9 11.5 9.7 11.4 9.5 11.4C8.3 11.4 7.4 12.4 7.4 13.5C7.4 14.7 8.4 15.6 9.5 15.6C10.7 15.6 11.7 14.7 11.7 13.5V5.5H13.5C13.5 5.5 13.5 5.8 13.6 6.2C13.8 7 14.5 7.7 15.3 8C15.7 8.1 16.1 8.2 16.5 8.2V8.5Z"
        fill="white"
      />
      <path
        d="M16.5 8.2C15.3 8.2 14.2 7.6 13.5 6.7V13.2C13.5 15.4 11.7 17.2 9.5 17.2C7.3 17.2 5.5 15.4 5.5 13.2C5.5 11 7.3 9.2 9.5 9.2"
        stroke="#25F4EE"
        strokeWidth="0.3"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M16.8 8.8C15.6 8.8 14.5 8.2 13.8 7.3V13.8C13.8 16 12 17.8 9.8 17.8C7.6 17.8 5.8 16 5.8 13.8C5.8 11.6 7.6 9.8 9.8 9.8"
        stroke="#FE2C55"
        strokeWidth="0.3"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// NETWORK CONFIG
// ═══════════════════════════════════════════════════════════
const NETWORKS: NetworkConfig[] = [
  {
    key: "instagram",
    label: "Instagram",
    color: "#1e3a5f",
    gradient: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af)",
    maxChars: 2200,
    icon: IgIcon,
  },
  { key: "facebook", label: "Facebook", color: "#1877F2", maxChars: 63206, icon: FbIcon },
  { key: "x", label: "X", color: "#000000", maxChars: 280, icon: XIconSvg },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2", maxChars: 3000, icon: LiIcon },
  { key: "tiktok", label: "TikTok", color: "#010101", maxChars: 2200, icon: TkIcon },
];

// ═══════════════════════════════════════════════════════════
// NETWORK SELECTOR DROPDOWN
// ═══════════════════════════════════════════════════════════
function NetworkSelector({ selected, onChange }: { selected: NetworkKey; onChange: (n: NetworkKey) => void }) {
  const [open, setOpen] = useState(false);
  const current = NETWORKS.find((n) => n.key === selected)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-white shadow-sm hover:shadow-md transition-all cursor-pointer w-full"
        style={{ background: current.key === "instagram" ? current.gradient || current.color : current.color }}
      >
        {current.icon(true)}
        <div className="flex-1 text-left">
          <span
            className="text-white/60"
            style={{ fontSize: "0.65rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}
          >
            Réseau sélectionné
          </span>
          <p className="text-white" style={{ fontSize: "0.92rem", fontWeight: 700 }}>
            {current.label.toUpperCase()}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/60 z-50 overflow-hidden py-1.5">
            {NETWORKS.map((net) => (
              <button
                key={net.key}
                onClick={() => {
                  onChange(net.key);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  net.key === selected ? "bg-[#1e3a5f]/[0.04]" : ""
                }`}
              >
                {net.icon(false)}
                <span
                  className={net.key === selected ? "text-[#1e3a5f]" : "text-gray-600"}
                  style={{ fontSize: "0.85rem", fontWeight: net.key === selected ? 700 : 500 }}
                >
                  {net.label}
                </span>
                {net.key === selected && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-auto">
                    <path
                      d="M3 8.5L6 11.5L13 4.5"
                      stroke="#1e3a5f"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// IPHONE SHELL (shared wrapper)
// ═══════════════════════════════════════════════════════════
function IPhoneShell({ children, bgColor = "white" }: { children: React.ReactNode; bgColor?: string }) {
  return (
    <div className="relative" style={{ width: 290 }}>
      <div
        className="rounded-[46px] p-[2.5px]"
        style={{ background: "linear-gradient(180deg, #8a8a8e 0%, #636366 50%, #8a8a8e 100%)" }}
      >
        <div className="bg-[#1c1c1e] rounded-[44px] p-[2.5px]">
          <div
            className="rounded-[42px] overflow-hidden flex flex-col relative"
            style={{ height: 600, background: bgColor }}
          >
            {/* Dynamic Island */}
            <div className="absolute top-[11px] left-1/2 -translate-x-1/2 z-30">
              <div
                className="bg-black rounded-[18px] flex items-center justify-center"
                style={{ width: 96, height: 28 }}
              >
                <div className="w-[10px] h-[10px] rounded-full bg-[#1c1c1e] border border-[#2c2c2e] ml-[46px]" />
              </div>
            </div>
            {/* Status Bar */}
            <div className="flex items-center justify-between px-8 pt-[14px] pb-0 relative z-20">
              <span className="text-[#0f1419]" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                9:41
              </span>
              <div className="flex items-center gap-[5px]">
                <svg width="15" height="10" viewBox="0 0 17 10.5" fill="none">
                  <rect x="0" y="6.5" width="3" height="4" rx=".7" fill="#0f1419" />
                  <rect x="4.5" y="4.5" width="3" height="6" rx=".7" fill="#0f1419" />
                  <rect x="9" y="2" width="3" height="8.5" rx=".7" fill="#0f1419" />
                  <rect x="13.5" y="0" width="3" height="10.5" rx=".7" fill="#0f1419" />
                </svg>
                <svg width="13" height="10" viewBox="0 0 15 12" fill="none">
                  <path d="M7.5 10.5L7.5 10.51" stroke="#0f1419" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M4.8 8.2C5.9 7 9.1 7 10.2 8.2" stroke="#0f1419" strokeWidth="1.2" strokeLinecap="round" />
                  <path
                    d="M2.2 5.6C4.5 3.2 10.5 3.2 12.8 5.6"
                    stroke="#0f1419"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex items-center gap-[1px]">
                  <div className="w-[22px] h-[10.5px] border-[1.3px] border-[#0f1419] rounded-[3px] flex items-center p-[1.5px]">
                    <div className="bg-[#0f1419] rounded-[1.5px] h-full w-[72%]" />
                  </div>
                  <div className="w-[1.5px] h-[4px] bg-[#0f1419] rounded-r-sm" />
                </div>
              </div>
            </div>
            {/* Content */}
            {children}
            {/* Home Indicator */}
            <div className="flex items-center justify-center pb-1.5 pt-0.5">
              <div className="w-[100px] h-[4px] rounded-full bg-[#1c1c1e]" />
            </div>
          </div>
        </div>
      </div>
      {/* Physical Buttons */}
      <div className="absolute top-[80px] -left-[3px] w-[3px] h-[22px] bg-[#7a7a7e] rounded-l-sm" />
      <div className="absolute top-[118px] -left-[3px] w-[3px] h-[40px] bg-[#7a7a7e] rounded-l-sm" />
      <div className="absolute top-[168px] -left-[3px] w-[3px] h-[40px] bg-[#7a7a7e] rounded-l-sm" />
      <div className="absolute top-[140px] -right-[3px] w-[3px] h-[56px] bg-[#7a7a7e] rounded-r-sm" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MEDIA PLACEHOLDER (shared)
// ═══════════════════════════════════════════════════════════
function MediaPlaceholder({
  uploadedFile,
  aspect = "1/1",
  bgColor = "#f0f0f0",
}: {
  uploadedFile: string | null;
  aspect?: string;
  bgColor?: string;
}) {
  if (uploadedFile) {
    return (
      <div className="w-full relative overflow-hidden" style={{ aspectRatio: aspect }}>
        <img src={uploadedFile} alt="Preview" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="w-full flex flex-col items-center justify-center gap-2"
      style={{ aspectRatio: aspect, background: bgColor }}
    >
      <div className="w-12 h-12 rounded-xl bg-white/40 flex items-center justify-center">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#aaa"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15L16 10L5 21" />
        </svg>
      </div>
      <span style={{ fontSize: "0.66rem", fontWeight: 500, color: "#999" }}>Aperçu de votre média</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INSTAGRAM PREVIEW
// ═══════════════════════════════════════════════════════════
function DirectIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

function InstagramPreview({ postText, uploadedFile, pageName }: { postText: string; uploadedFile: string | null; pageName: string }) {
  return (
    <IPhoneShell bgColor="white">
      {/* Instagram Header */}
      <div className="flex items-center justify-between px-4 pt-1 pb-2 mt-1">
        <svg width="93" height="26" viewBox="0 0 120 34" fill="none" className="text-gray-900">
          <text
            x="0"
            y="25"
            fill="currentColor"
            style={{
              fontSize: "22px",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              fontWeight: 500,
              fontStyle: "italic",
            }}
          >
            Instagram
          </text>
        </svg>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Heart className="w-[21px] h-[21px] text-[#1c1c1e]" strokeWidth={1.6} />
            <div className="absolute -top-0.5 -right-0.5 w-[7px] h-[7px] rounded-full bg-red-500 border border-white" />
          </div>
          <div className="relative text-[#1c1c1e]">
            <DirectIcon />
            <div
              className="absolute -top-1 -right-1.5 bg-red-500 text-white rounded-full px-1 flex items-center justify-center"
              style={{ fontSize: "0.5rem", fontWeight: 700, minWidth: 13, height: 13 }}
            >
              3
            </div>
          </div>
        </div>
      </div>

      {/* Stories Bar */}
      <div className="flex items-center gap-3 px-3.5 py-2 border-b border-gray-100/60">
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            <div className="w-[42px] h-[42px] rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
              <span className="text-white" style={{ fontSize: "0.55rem", fontWeight: 700 }}>
                +
              </span>
            </div>
          </div>
          <span className="text-gray-500" style={{ fontSize: "0.55rem" }}>
            Vous
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div
            className="p-[2px] rounded-full"
            style={{ background: "linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)" }}
          >
            <div
              className="w-[42px] h-[42px] rounded-full border-2 border-white flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              <Leaf className="w-4 h-4 text-white" />
            </div>
          </div>
          <span className="text-gray-800" style={{ fontSize: "0.55rem", fontWeight: 500 }}>
            {(pageName || "greenlife").slice(0, 10)}
          </span>
        </div>
        {["eco_ma...", "bio_be..."].map((n, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="p-[2px] rounded-full"
              style={{ background: "linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf)" }}
            >
              <div
                className={`w-[42px] h-[42px] rounded-full border-2 border-white ${i === 0 ? "bg-orange-100" : "bg-purple-100"}`}
              />
            </div>
            <span className="text-gray-500" style={{ fontSize: "0.55rem" }}>
              {n}
            </span>
          </div>
        ))}
      </div>

      {/* Feed Post */}
      <div className="flex-1 overflow-y-auto">
        {/* Post Header */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            <Leaf className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[#1c1c1e] truncate" style={{ fontSize: "0.76rem", fontWeight: 600 }}>
                {pageName || "greenlifebio"}
              </p>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <circle cx="12" cy="12" r="10" fill="#3897f0" />
                <path
                  d="M8 12.5L10.5 15L16 9.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-gray-400" style={{ fontSize: "0.6rem" }}>
              {pageName || "GreenLife Bio"}
            </p>
          </div>
          <MoreHorizontal className="w-4 h-4 text-[#1c1c1e] shrink-0" />
        </div>

        {/* Post Image — square */}
        <MediaPlaceholder uploadedFile={uploadedFile} aspect="1/1" bgColor="#efefef" />

        {/* Action Icons */}
        <div className="px-3.5 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-[14px]">
            <Heart className="w-[22px] h-[22px] text-[#1c1c1e]" strokeWidth={1.5} />
            <MessageCircle className="w-[22px] h-[22px] text-[#1c1c1e] -scale-x-100" strokeWidth={1.5} />
            <DirectIcon />
          </div>
          <Bookmark className="w-[22px] h-[22px] text-[#1c1c1e]" strokeWidth={1.5} />
        </div>

        {/* Likes */}
        <div className="px-3.5 pt-1">
          <p className="text-[#1c1c1e]" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
            1 248 J'aime
          </p>
        </div>

        {/* Caption */}
        <div className="px-3.5 pt-1 pb-1.5">
          <p className="text-[#1c1c1e]" style={{ fontSize: "0.72rem", lineHeight: "1.5" }}>
            <span style={{ fontWeight: 600 }}>{pageName || "greenlifebio"} </span>
            {postText.length > 0
              ? postText.slice(0, 120) + (postText.length > 120 ? "..." : "")
              : "Votre texte apparaîtra ici..."}
          </p>
          {postText.length > 120 && (
            <span className="text-gray-400 mt-0.5 inline-block" style={{ fontSize: "0.68rem" }}>
              plus
            </span>
          )}
        </div>
        <div className="px-3.5 pb-1">
          <p className="text-gray-400" style={{ fontSize: "0.66rem" }}>
            Voir les 42 commentaires
          </p>
        </div>
        <div className="px-3.5 pb-3">
          <p className="text-gray-300 uppercase" style={{ fontSize: "0.56rem", letterSpacing: "0.02em" }}>
            Il y a 2 heures
          </p>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-white border-t border-gray-100 px-5 pt-2 pb-1 flex items-center justify-between">
        <Home className="w-[22px] h-[22px] text-[#1c1c1e]" strokeWidth={1.8} fill="#1c1c1e" />
        <Search className="w-[22px] h-[22px] text-[#1c1c1e]" strokeWidth={1.6} />
        <PlusSquare className="w-[22px] h-[22px] text-[#1c1c1e]" strokeWidth={1.6} />
        <Play className="w-[22px] h-[22px] text-[#1c1c1e]" strokeWidth={1.6} />
        <div
          className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
        >
          <Leaf className="w-2.5 h-2.5 text-white" />
        </div>
      </div>
    </IPhoneShell>
  );
}

// ═══════════════════════════════════════════════════════════
// FACEBOOK PREVIEW
// ═══════════════════════════════════════════════════════════
function FbLikeReaction() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#1877F2" />
      <path d="M4.5 8.5V11.5H6V8.5L7.5 6.5V4.5L5.5 5L4.5 8.5Z" fill="white" />
      <path
        d="M6 8.5H10.5C11 8.5 11.5 8 11.5 7.5C11.5 7 11 6.5 10.5 6.5H8.5L9 5C9 4.5 8.5 4 8 4L6 7V8.5Z"
        fill="white"
      />
    </svg>
  );
}
function FbHeartReaction() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#F33E58" />
      <path
        d="M8 12C8 12 4 9.5 4 7C4 5.5 5.2 4.5 6.5 4.5C7.2 4.5 7.7 4.8 8 5.3C8.3 4.8 8.8 4.5 9.5 4.5C10.8 4.5 12 5.5 12 7C12 9.5 8 12 8 12Z"
        fill="white"
      />
    </svg>
  );
}

function FacebookPreview({ postText, uploadedFile, pageName }: { postText: string; uploadedFile: string | null; pageName: string }) {
  return (
    <IPhoneShell bgColor="#f0f2f5">
      {/* Facebook Header */}
      <div className="bg-white px-3.5 pt-0.5 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-[#1877F2]" style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
            facebook
          </span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#e4e6eb] flex items-center justify-center">
              <Search className="w-[15px] h-[15px] text-[#050505]" strokeWidth={2.2} />
            </div>
            <div className="w-8 h-8 rounded-full bg-[#e4e6eb] flex items-center justify-center relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#050505">
                <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.936 1.444 5.544 3.7 7.254V22l3.3-1.81c.88.244 1.813.377 2.78.377h.22c5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.07 12.4l-2.54-2.71L5.17 14.4l5.94-6.31 2.6 2.71L18.93 7.6l-5.86 6.8z" />
              </svg>
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-[1.5px] border-white">
                <span className="text-white" style={{ fontSize: "0.48rem", fontWeight: 700 }}>
                  5
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white flex items-center justify-around px-2 border-b border-[#e4e6eb]">
        <div className="flex-1 flex justify-center py-2 border-b-[2.5px] border-[#1877F2]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M9.464 2.486a4 4 0 015.072 0l6 5A4 4 0 0122 10.586V18a4 4 0 01-4 4H6a4 4 0 01-4-4v-7.414a4 4 0 011.464-3.1l6-5zM10 17a2 2 0 014 0v3h-4v-3z" />
          </svg>
        </div>
        {[
          <svg key="fr" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#65676B" strokeWidth="1.8" strokeLinecap="round">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>,
          <svg key="tv" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#65676B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
          </svg>,
          <svg key="mk" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#65676B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" />
          </svg>,
          <svg key="bell" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#65676B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>,
        ].map((icon, i) => (
          <div key={i} className="flex-1 flex justify-center py-2 border-b-[2.5px] border-transparent">
            {icon}
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="h-2" />
        <div className="bg-white">
          <div className="flex items-start gap-2.5 px-3 pt-3 pb-1.5">
            <div
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[#050505] truncate" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                  {pageName || "GreenLife Bio"}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#1877F2" />
                  <path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[#65676B]" style={{ fontSize: "0.65rem" }}>Sponsorisé</span>
                <span className="text-[#65676B]" style={{ fontSize: "0.55rem" }}>·</span>
                <Globe className="w-[10px] h-[10px] text-[#65676B]" strokeWidth={2} />
              </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-[#65676B] shrink-0 mt-0.5" />
          </div>
          <div className="px-3 pb-2.5">
            <p className="text-[#050505]" style={{ fontSize: "0.76rem", lineHeight: "1.45" }}>
              {postText.length > 0 ? postText.slice(0, 160) + (postText.length > 160 ? "..." : "") : "Votre texte apparaîtra ici..."}
            </p>
            {postText.length > 160 && (
              <span className="text-[#65676B] mt-0.5 inline-block" style={{ fontSize: "0.7rem", fontWeight: 500 }}>Voir plus</span>
            )}
          </div>
          <MediaPlaceholder uploadedFile={uploadedFile} aspect="4/3" bgColor="#e4e6eb" />
          <div className="px-3 pt-2 pb-1 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-0.5">
                <FbLikeReaction />
                <FbHeartReaction />
              </div>
              <span className="text-[#65676B] ml-1" style={{ fontSize: "0.7rem" }}>Sophie M. et 247 autres</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#65676B]" style={{ fontSize: "0.66rem" }}>18 comm.</span>
              <span className="text-[#65676B]" style={{ fontSize: "0.66rem" }}>12 part.</span>
            </div>
          </div>
          <div className="mx-3 border-t border-[#e4e6eb]" />
          <div className="px-1.5 py-0.5 flex items-center justify-around">
            {[
              { icon: <ThumbsUp className="w-4 h-4 text-[#65676B]" strokeWidth={1.6} />, label: "J'aime" },
              { icon: <MessageCircle className="w-4 h-4 text-[#65676B] -scale-x-100" strokeWidth={1.6} />, label: "Commenter" },
              { icon: <Share2 className="w-4 h-4 text-[#65676B]" strokeWidth={1.6} />, label: "Partager" },
            ].map(({ icon, label }) => (
              <button key={label} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md hover:bg-[#f0f2f5] transition-colors cursor-pointer">
                {icon}
                <span className="text-[#65676B]" style={{ fontSize: "0.72rem", fontWeight: 600 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="h-2" />
      </div>
    </IPhoneShell>
  );
}

// ═══════════════════════════════════════════════════════════
// X (TWITTER) PREVIEW
// ═══════════════════════════════════════════════════════════
function XPreview({ postText, uploadedFile }: { postText: string; uploadedFile: string | null }) {
  return (
    <IPhoneShell bgColor="white">
      {/* X Nav Bar */}
      <div className="flex items-center justify-between px-4 pt-1.5 pb-2 mt-1 border-b border-[#eff3f4]">
        <ArrowLeft className="w-[18px] h-[18px] text-[#0f1419]" strokeWidth={2} />
        <span className="text-[#0f1419]" style={{ fontSize: "0.82rem", fontWeight: 700 }}>Post</span>
        <div className="w-[18px]" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-3.5 pt-3">
          <div className="flex items-start gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[#0f1419] truncate" style={{ fontSize: "0.8rem", fontWeight: 700 }}>GreenLife Bio</span>
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none" className="shrink-0">
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.637-.08 1.296.144 1.9-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.9.13.635.433 1.22.878 1.69.47.443 1.055.747 1.69.878.635.132 1.294.084 1.902-.14.272.587.702 1.086 1.24 1.44.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246-5.683 6.206z" fill="#1d9bf0" />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#536471]" style={{ fontSize: "0.72rem" }}>@greenlife_bio</span>
                <span className="text-[#536471]" style={{ fontSize: "0.72rem" }}>·</span>
                <span className="text-[#536471]" style={{ fontSize: "0.72rem" }}>2h</span>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-[#536471] shrink-0 mt-1" />
          </div>
          <div className="mt-2.5">
            <p className="text-[#0f1419]" style={{ fontSize: "0.8rem", lineHeight: "1.45" }}>
              {postText.length > 0 ? postText.slice(0, 280) : "Votre texte apparaîtra ici..."}
            </p>
          </div>
          <div className="mt-2.5 rounded-2xl overflow-hidden border border-[#cfd9de]">
            <MediaPlaceholder uploadedFile={uploadedFile} aspect="16/9" bgColor="#f7f9f9" />
          </div>
          <div className="flex items-center gap-1.5 mt-3 pb-2.5 border-b border-[#eff3f4]">
            <span className="text-[#536471]" style={{ fontSize: "0.68rem" }}>10:00 AM</span>
            <span className="text-[#536471]" style={{ fontSize: "0.68rem" }}>·</span>
            <span className="text-[#536471]" style={{ fontSize: "0.68rem" }}>15 mars 2026</span>
            <span className="text-[#536471]" style={{ fontSize: "0.68rem" }}>·</span>
            <span className="text-[#0f1419]" style={{ fontSize: "0.68rem", fontWeight: 700 }}>12,4k</span>
            <span className="text-[#536471]" style={{ fontSize: "0.68rem" }}>vues</span>
          </div>
          <div className="flex items-center gap-4 py-2.5 border-b border-[#eff3f4]">
            {[
              { n: "42", l: "Reposts" },
              { n: "18", l: "Citations" },
              { n: "1 248", l: "J'aime" },
              { n: "3", l: "Signets" },
            ].map(({ n, l }) => (
              <div key={l} className="flex items-center gap-1">
                <span className="text-[#0f1419]" style={{ fontSize: "0.72rem", fontWeight: 700 }}>{n}</span>
                <span className="text-[#536471]" style={{ fontSize: "0.72rem" }}>{l}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-around py-1.5 border-b border-[#eff3f4]">
            {[
              <svg key="c" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#536471" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>,
              <svg key="r" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#536471" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
              </svg>,
              <Heart className="w-[18px] h-[18px] text-[#536471]" strokeWidth={1.6} />,
              <svg key="ch" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#536471" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
              </svg>,
              <svg key="bk" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#536471" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>,
            ].map((icon, i) => (
              <button key={i} className="p-1.5 rounded-full hover:bg-[#1d9bf0]/10 transition-colors cursor-pointer">
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-t border-[#eff3f4] px-6 pt-2 pb-1 flex items-center justify-between">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="#0f1419">
          <path d="M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.26.173-.409.456-.409.757v13.183c0 .502.418.913.929.913h5.753a.93.93 0 00.929-.913v-7.075h3.818v7.075c0 .502.418.913.93.913h5.753a.93.93 0 00.929-.913V7.903c0-.3-.15-.584-.41-.757z" />
        </svg>
        <Search className="w-[21px] h-[21px] text-[#536471]" strokeWidth={1.8} />
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#536471" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#536471" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#536471" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
        </svg>
      </div>
    </IPhoneShell>
  );
}

// ═══════════════════════════════════════════════════════════
// LINKEDIN PREVIEW
// ═══════════════════════════════════════════════════════════
function LiThumbReaction() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#378FE9" />
      <path d="M7 14.5V10H8.5L11 7V5.5C11 5 11.5 4.5 12 4.5C12.5 4.5 13 5 13 5.5V9H16.5C17.3 9 18 9.7 18 10.5L17 15C16.8 15.6 16.3 16 15.5 16H9.5C8.7 16 8 15.3 8 14.5H7Z" fill="white" />
    </svg>
  );
}
function LiHeartReaction() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#E16745" />
      <path d="M12 17C12 17 6.5 13.5 6.5 10C6.5 8 8 6.5 9.75 6.5C10.7 6.5 11.5 7 12 7.7C12.5 7 13.3 6.5 14.25 6.5C16 6.5 17.5 8 17.5 10C17.5 13.5 12 17 12 17Z" fill="white" />
    </svg>
  );
}
function LiIdeaReaction() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#F5BB5C" />
      <path d="M12 5C9.2 5 7 7.2 7 10C7 11.8 7.9 13.4 9.3 14.3C9.7 14.6 10 15 10 15.5V16.5C10 17.3 10.7 18 11.5 18H12.5C13.3 18 14 17.3 14 16.5V15.5C14 15 14.3 14.6 14.7 14.3C16.1 13.4 17 11.8 17 10C17 7.2 14.8 5 12 5Z" fill="white" />
      <rect x="10" y="18.5" width="4" height="1" rx=".5" fill="white" />
    </svg>
  );
}

function LinkedInPreview({ postText, uploadedFile }: { postText: string; uploadedFile: string | null }) {
  return (
    <IPhoneShell bgColor="#f4f2ee">
      {/* LinkedIn Header */}
      <div className="bg-white px-3 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-[1.5px] border-[#0A66C2]"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            <Leaf className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1 bg-[#edf3f8] rounded-[4px] px-2.5 py-[5px] flex items-center gap-1.5">
            <Search className="w-[13px] h-[13px] text-[#666]" strokeWidth={2.2} />
            <span className="text-[#666]" style={{ fontSize: "0.68rem" }}>Rechercher</span>
          </div>
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-[#666]" strokeWidth={1.5} />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#cc1016] rounded-full flex items-center justify-center border border-white">
              <span className="text-white" style={{ fontSize: "0.42rem", fontWeight: 700 }}>4</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="h-1.5" />
        <div className="bg-white border-t border-b border-[#e0dfdc]">
          <div className="flex items-start gap-2 px-3 pt-3 pb-1">
            <div
              className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[#191919] truncate" style={{ fontSize: "0.78rem", fontWeight: 600 }}>GreenLife Bio</span>
                <span className="text-[#666]" style={{ fontSize: "0.65rem" }}>· 1er</span>
              </div>
              <p className="text-[#666] truncate" style={{ fontSize: "0.62rem", lineHeight: "1.3" }}>Produits Bio de Qualité • 5 234 abonnés</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[#666]" style={{ fontSize: "0.6rem" }}>Sponsorisé</span>
                <span className="text-[#666]" style={{ fontSize: "0.5rem" }}>•</span>
                <Globe className="w-[11px] h-[11px] text-[#666]" strokeWidth={2} />
              </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-[#666] shrink-0 mt-0.5" />
          </div>
          <div className="px-3 pt-1 pb-2">
            <p className="text-[#191919]" style={{ fontSize: "0.74rem", lineHeight: "1.45" }}>
              {postText.length > 0 ? postText.slice(0, 140) + (postText.length > 140 ? "..." : "") : "Votre texte apparaîtra ici..."}
            </p>
            {postText.length > 140 && (
              <span className="text-[#666] mt-0.5 inline-block cursor-pointer" style={{ fontSize: "0.68rem", fontWeight: 500 }}>...voir plus</span>
            )}
          </div>
          <MediaPlaceholder uploadedFile={uploadedFile} aspect="16/10" bgColor="#e9e5df" />
          <div className="px-3 pt-2 pb-1 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex -space-x-1">
                <LiThumbReaction />
                <LiHeartReaction />
                <LiIdeaReaction />
              </div>
              <span className="text-[#666] ml-1.5" style={{ fontSize: "0.66rem" }}>Sophie M. et 182 autres</span>
            </div>
            <span className="text-[#666]" style={{ fontSize: "0.64rem" }}>24 commentaires</span>
          </div>
          <div className="mx-3 border-t border-[#e0dfdc]" />
          <div className="px-1 py-0.5 flex items-center justify-around">
            {[
              { icon: <ThumbsUp className="w-4 h-4 text-[#666]" strokeWidth={1.5} />, label: "J'aime" },
              { icon: <MessageCircle className="w-4 h-4 text-[#666]" strokeWidth={1.5} />, label: "Commenter" },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                  </svg>
                ),
                label: "Republier",
              },
              { icon: <Send className="w-4 h-4 text-[#666]" strokeWidth={1.5} />, label: "Envoyer" },
            ].map(({ icon, label }) => (
              <button key={label} className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-md hover:bg-[#f4f2ee] transition-colors cursor-pointer">
                {icon}
                <span className="text-[#666]" style={{ fontSize: "0.6rem", fontWeight: 600 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="h-2" />
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-t border-[#e0dfdc] px-4 pt-1.5 pb-0.5 flex items-center justify-around">
        <div className="flex flex-col items-center gap-0.5">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="#191919">
            <path d="M23 9v2h-2v7a3 3 0 01-3 3h-4v-6h-4v6H6a3 3 0 01-3-3v-7H1V9l11-7 5 3.18V2h3v5.09z" />
          </svg>
          <span className="text-[#191919]" style={{ fontSize: "0.48rem", fontWeight: 700 }}>Accueil</span>
          <div className="w-4 h-[2px] rounded-full bg-[#191919] -mt-0.5" />
        </div>
        {[
          { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.6" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>, l: "Réseau" },
          { icon: <PlusSquare className="w-[19px] h-[19px] text-[#666]" strokeWidth={1.6} />, l: "Publier" },
          { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>, l: "Notif." },
          { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>, l: "Emplois" },
        ].map(({ icon, l }) => (
          <div key={l} className="flex flex-col items-center gap-0.5">
            {icon}
            <span className="text-[#666]" style={{ fontSize: "0.48rem" }}>{l}</span>
          </div>
        ))}
      </div>
    </IPhoneShell>
  );
}

// ═══════════════════════════════════════════════════════════
// TIKTOK PREVIEW
// ═══════════════════════════════════════════════════════════
function TikTokPreview({ postText, uploadedFile }: { postText: string; uploadedFile: string | null }) {
  return (
    <IPhoneShell bgColor="#000">
      {/* Full dark screen */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {/* Video area */}
        {uploadedFile ? (
          <video src={uploadedFile} className="absolute inset-0 w-full h-full object-cover" muted loop />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Video className="w-10 h-10 text-white/20" strokeWidth={1.2} />
              <span className="text-white/30" style={{ fontSize: "0.7rem" }}>Aperçu vidéo</span>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center gap-5 pt-2 px-4">
          <span className="text-white/50" style={{ fontSize: "0.78rem", fontWeight: 500 }}>Suivis</span>
          <span className="text-white" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Pour toi</span>
          <div className="absolute right-4">
            <Search className="w-[18px] h-[18px] text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Right side icons */}
        <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-5">
          {/* Profile */}
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FE2C55] flex items-center justify-center border-2 border-black">
              <span className="text-white" style={{ fontSize: "0.5rem", fontWeight: 700 }}>+</span>
            </div>
          </div>
          {/* Like */}
          <div className="flex flex-col items-center gap-1">
            <Heart className="w-7 h-7 text-white" strokeWidth={1.8} fill="white" />
            <span className="text-white" style={{ fontSize: "0.6rem", fontWeight: 500 }}>24.5K</span>
          </div>
          {/* Comment */}
          <div className="flex flex-col items-center gap-1">
            <MessageCircle className="w-7 h-7 text-white" strokeWidth={1.8} />
            <span className="text-white" style={{ fontSize: "0.6rem", fontWeight: 500 }}>892</span>
          </div>
          {/* Bookmark */}
          <div className="flex flex-col items-center gap-1">
            <Bookmark className="w-6 h-6 text-white" strokeWidth={1.8} />
            <span className="text-white" style={{ fontSize: "0.6rem", fontWeight: 500 }}>1.2K</span>
          </div>
          {/* Share */}
          <div className="flex flex-col items-center gap-1">
            <Share2 className="w-6 h-6 text-white" strokeWidth={1.8} />
            <span className="text-white" style={{ fontSize: "0.6rem", fontWeight: 500 }}>348</span>
          </div>
          {/* Spinning disc */}
          <div className="w-9 h-9 rounded-full border-[3px] border-[#333] bg-gradient-to-br from-[#333] to-[#111] flex items-center justify-center animate-spin" style={{ animationDuration: "3s" }}>
            <div className="w-3 h-3 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Bottom caption area */}
        <div className="absolute bottom-4 left-0 right-14 z-10 px-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-white" style={{ fontSize: "0.82rem", fontWeight: 700 }}>@greenlifebio</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#20D5EC" />
              <path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-white/90" style={{ fontSize: "0.72rem", lineHeight: "1.4" }}>
            {postText.length > 0
              ? postText.slice(0, 100) + (postText.length > 100 ? "..." : "")
              : "Votre légende apparaîtra ici..."}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <Music className="w-3 h-3 text-white" strokeWidth={2} />
            <div className="overflow-hidden max-w-[150px]">
              <span className="text-white/80 whitespace-nowrap" style={{ fontSize: "0.65rem" }}>
                🎵 Son original — greenlifebio
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-black px-3 pt-2 pb-1 flex items-center justify-around">
        <div className="flex flex-col items-center gap-0.5">
          <Home className="w-5 h-5 text-white" strokeWidth={1.8} fill="white" />
          <span className="text-white" style={{ fontSize: "0.48rem", fontWeight: 600 }}>Accueil</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Search className="w-5 h-5 text-white/50" strokeWidth={1.8} />
          <span className="text-white/50" style={{ fontSize: "0.48rem" }}>Découvrir</span>
        </div>
        {/* Plus button */}
        <div className="relative w-10 h-7">
          <div className="absolute left-0 top-0 w-[34px] h-full rounded-lg bg-[#25F4EE]" />
          <div className="absolute right-0 top-0 w-[34px] h-full rounded-lg bg-[#FE2C55]" />
          <div className="absolute inset-0 mx-auto w-[34px] h-full rounded-lg bg-white flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <MessageCircle className="w-5 h-5 text-white/50" strokeWidth={1.8} />
          <span className="text-white/50" style={{ fontSize: "0.48rem" }}>Boîte</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <User className="w-5 h-5 text-white/50" strokeWidth={1.8} />
          <span className="text-white/50" style={{ fontSize: "0.48rem" }}>Profil</span>
        </div>
      </div>
    </IPhoneShell>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export function CreationView() {
  const { user } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey>("instagram");
  const [postText, setPostText] = useState(
    "Decouvrez notre nouvelle gamme de soins 100% naturels ! Des ingredients bio, sources localement, pour une peau eclatante au quotidien.\n\n#GreenLifeBio #Naturel #Skincare",
  );
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("2026-03-15");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TikTok-specific state
  const [tiktokPrivacy, setTiktokPrivacy] = useState("public");
  const [tiktokComments, setTiktokComments] = useState(true);
  const [tiktokDuet, setTiktokDuet] = useState(true);
  const [tiktokStitch, setTiktokStitch] = useState(true);

  const [metaConnections, setMetaConnections] = useState<MetaConnection[]>([]);

  // Fetch Meta connections
  useEffect(() => {
    if (!user) return;
    const fetchConnections = async () => {
      const { data } = await supabase
        .from("social_connections")
        .select("platform, page_id, expires_at")
        .eq("user_id", user.id);
      setMetaConnections(data || []);
    };
    fetchConnections();
  }, [user]);

  const fbConnection = metaConnections.find(c => c.platform === "facebook");
  const igConnection = metaConnections.find(c => c.platform === "instagram");
  const isExpired = (d: string | null) => d ? new Date(d) < new Date() : false;
  const hasActiveConnection = (platform: string) => {
    const conn = metaConnections.find(c => c.platform === platform);
    return conn && !isExpired(conn.expires_at);
  };
  const canPublish = selectedNetwork === "instagram" ? hasActiveConnection("instagram") : selectedNetwork === "facebook" ? hasActiveConnection("facebook") : false;

  const isTikTok = selectedNetwork === "tiktok";
  const currentNetwork = NETWORKS.find((n) => n.key === selectedNetwork)!;
  const charCount = postText.length;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (isTikTok) {
      if (file.type === "video/mp4" || file.type === "video/webm") {
        setUploadedFile(URL.createObjectURL(file));
      }
    } else {
      if (file.type.startsWith("image/")) {
        setUploadedFile(URL.createObjectURL(file));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isTikTok) {
      if (file.type === "video/mp4" || file.type === "video/webm") {
        setUploadedFile(URL.createObjectURL(file));
      }
    } else {
      if (file.type.startsWith("image/")) {
        setUploadedFile(URL.createObjectURL(file));
      }
    }
  };

  // Reset uploaded file when switching networks
  const handleNetworkChange = (n: NetworkKey) => {
    setSelectedNetwork(n);
    setUploadedFile(null);
  };

  const handlePublish = async () => {
    if (!user) {
      toast({ title: "Erreur", description: "Vous devez être connecté.", variant: "destructive" });
      return;
    }
    if (selectedNetwork !== "instagram" && selectedNetwork !== "facebook") {
      toast({ title: "Non supporté", description: "Seules les publications Instagram et Facebook sont prises en charge pour le moment.", variant: "destructive" });
      return;
    }
    setPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke("publish-to-meta", {
        body: {
          platform: selectedNetwork,
          message: postText,
          image_url: uploadedFile || undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Publié !", description: `Votre post a été publié sur ${selectedNetwork === "instagram" ? "Instagram" : "Facebook"}.` });
    } catch (err: any) {
      toast({ title: "Erreur de publication", description: err.message || "La publication a échoué.", variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  const renderPreview = () => {
    switch (selectedNetwork) {
      case "instagram":
        return <InstagramPreview postText={postText} uploadedFile={uploadedFile} pageName={igConnection?.page_id || ""} />;
      case "facebook":
        return <FacebookPreview postText={postText} uploadedFile={uploadedFile} pageName={fbConnection?.page_id || ""} />;
      case "x":
        return <XPreview postText={postText} uploadedFile={uploadedFile} />;
      case "linkedin":
        return <LinkedInPreview postText={postText} uploadedFile={uploadedFile} />;
      case "tiktok":
        return <TikTokPreview postText={postText} uploadedFile={uploadedFile} />;
    }
  };

  return (
    <div className="flex gap-6 h-full">
      {/* ═══ LEFT — Form (60%) ═══ */}
      <div className="w-[60%] flex flex-col min-h-0 overflow-y-auto pr-1">
        <div className="mb-5">
          <h1 className="text-gray-900" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
            Nouveau Post
          </h1>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.82rem" }}>
            Créez et planifiez une publication pour GreenLife Bio
          </p>
          {/* Meta connection status */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5">
              <Facebook className="w-4 h-4 text-[#1877F2]" />
              {fbConnection ? (
               <Badge variant={isExpired(fbConnection.expires_at) ? "destructive" : "default"} className="text-[10px]">
                  {isExpired(fbConnection.expires_at) ? "Expiré" : `Connecté${fbConnection.page_id ? ` · ${fbConnection.page_id}` : ""}`}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">Non connecté</Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Instagram className="w-4 h-4 text-[#E1306C]" />
              {igConnection ? (
                <Badge variant={isExpired(igConnection.expires_at) ? "destructive" : "default"} className="text-[10px]">
                  {isExpired(igConnection.expires_at) ? "Expiré" : `Connecté${igConnection.page_id ? ` · ${igConnection.page_id}` : ""}`}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">Non connecté</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5">
          {/* Network Selector */}
          <div>
            <label className="text-gray-600 block mb-2.5" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              Réseau social
            </label>
            <NetworkSelector selected={selectedNetwork} onChange={handleNetworkChange} />
          </div>

          {/* Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-gray-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                {isTikTok ? "Légende de la vidéo" : "Contenu de la publication"}
              </label>
              <span
                className={charCount > currentNetwork.maxChars ? "text-red-500" : "text-gray-300"}
                style={{ fontSize: "0.72rem", fontWeight: 500 }}
              >
                {charCount} / {currentNetwork.maxChars}
              </span>
            </div>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={isTikTok ? 4 : 6}
              maxLength={currentNetwork.maxChars}
              className="w-full rounded-xl border border-gray-150 px-4 py-3 text-gray-700 placeholder-gray-250 resize-none focus:outline-none focus:border-[#1e3a5f]/30 focus:ring-2 focus:ring-[#1e3a5f]/10 transition-all"
              style={{ fontSize: "0.88rem", lineHeight: "1.65" }}
              placeholder={isTikTok ? "Ajoutez une légende à votre vidéo TikTok…" : "Rédigez votre publication ici…"}
            />
          </div>

          {/* TikTok-specific settings */}
          {isTikTok && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 flex flex-col gap-4">
              <label className="text-gray-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                Paramètres TikTok
              </label>

              {/* Privacy */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500" style={{ fontSize: "0.82rem" }}>Confidentialité</span>
                <Select value={tiktokPrivacy} onValueChange={setTiktokPrivacy}>
                  <SelectTrigger className="w-[160px] h-9 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Amis</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500" style={{ fontSize: "0.82rem" }}>Autoriser les commentaires</span>
                <Switch checked={tiktokComments} onCheckedChange={setTiktokComments} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500" style={{ fontSize: "0.82rem" }}>Autoriser le Duo</span>
                <Switch checked={tiktokDuet} onCheckedChange={setTiktokDuet} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500" style={{ fontSize: "0.82rem" }}>Autoriser le Collage (Stitch)</span>
                <Switch checked={tiktokStitch} onCheckedChange={setTiktokStitch} />
              </div>
            </div>
          )}

          {/* Upload */}
          <div>
            <label className="text-gray-600 block mb-2.5" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              {isTikTok ? "Vidéo" : "Média"}
            </label>
            {uploadedFile ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-100">
                {isTikTok ? (
                  <video src={uploadedFile} className="w-full h-48 object-cover" controls />
                ) : (
                  <img src={uploadedFile} alt="Uploaded" className="w-full h-48 object-cover" />
                )}
                <button
                  onClick={() => setUploadedFile(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 cursor-pointer transition-all ${isDragging ? "border-[#1e3a5f] bg-[#1e3a5f]/[0.03]" : "border-gray-200 hover:border-[#1e3a5f]/30 hover:bg-gray-50/50"}`}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                  {isTikTok ? (
                    <Video className="w-5 h-5 text-gray-300" strokeWidth={1.8} />
                  ) : (
                    <Upload className="w-5 h-5 text-gray-300" strokeWidth={1.8} />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-gray-500" style={{ fontSize: "0.84rem", fontWeight: 500 }}>
                    {isTikTok ? "Glissez votre vidéo ici ou " : "Glissez votre image ici ou "}
                    <span className="text-[#1e3a5f]" style={{ fontWeight: 600 }}>
                      parcourir
                    </span>
                  </p>
                  <p className="text-gray-250 mt-1" style={{ fontSize: "0.72rem" }}>
                    {isTikTok ? "MP4 ou WebM — max 500 Mo" : "PNG, JPG ou WebP — max 10 Mo"}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={isTikTok ? "video/mp4,video/webm" : "image/*"}
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-50 pt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-gray-150 px-3 py-[7px] bg-white">
                <CalendarClock className="w-3.5 h-3.5 text-gray-300" />
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="text-gray-600 bg-transparent focus:outline-none cursor-pointer"
                  style={{ fontSize: "0.8rem" }}
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-gray-150 px-3 py-[7px] bg-white">
                <Clock className="w-3.5 h-3.5 text-gray-300" />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="text-gray-600 bg-transparent focus:outline-none cursor-pointer"
                  style={{ fontSize: "0.8rem" }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 rounded-xl px-5 py-[9px] border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                style={{ fontSize: "0.84rem", fontWeight: 500 }}
              >
                <Clock className="w-4 h-4" strokeWidth={1.8} />
                <span>Programmer</span>
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing || !canPublish}
                className="flex items-center gap-2 rounded-xl px-5 py-[9px] text-white shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)",
                  fontSize: "0.84rem",
                  fontWeight: 500,
                }}
              >
                {publishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" strokeWidth={1.8} />
                )}
                <span>{publishing ? "Publication..." : "Publier maintenant"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT — iPhone Preview (40%) ═══ */}
      <div className="w-[40%] flex flex-col min-h-0">
        <div className="mb-5">
          <h2 className="text-gray-900" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
            Aperçu mobile
          </h2>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.78rem" }}>
            Rendu fidèle — {currentNetwork.label}
          </p>
        </div>
        <div className="flex-1 flex items-start justify-center">{renderPreview()}</div>
      </div>
    </div>
  );
}
