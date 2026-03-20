import { useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
} from "lucide-react";

// ── Types ──
type Network = "instagram" | "facebook" | "x" | "linkedin";
type Status = "published" | "scheduled" | "draft";

interface CalendarPost {
  id: string;
  title: string;
  network: Network;
  status: Status;
}

// ── Mock data ──
function getMockPosts(): Record<string, CalendarPost[]> {
  return {
    "2026-03-02": [
      { id: "p1", title: "Lancement gamme printemps", network: "instagram", status: "published" },
    ],
    "2026-03-04": [
      { id: "p2", title: "Recette smoothie détox", network: "facebook", status: "published" },
      { id: "p3", title: "Story coulisses atelier", network: "instagram", status: "published" },
    ],
    "2026-03-12": [
      { id: "p6", title: "Nouveau packaging éco", network: "instagram", status: "scheduled" },
    ],
    "2026-03-20": [
      { id: "p10", title: "Carousel 5 astuces beauté", network: "instagram", status: "draft" },
    ],
  };
}

// ── Helpers ──
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  const days: { date: Date; currentMonth: boolean }[] = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  for (let i = startDow - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      currentMonth: false,
    });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), currentMonth: true });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), currentMonth: false });
    }
  }

  return days;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(d: Date) {
  const t = new Date();
  return d.toDateString() === t.toDateString();
}

// ── Status config ──
const statusConfig: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  published: { label: "Publié", dot: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700" },
  scheduled: { label: "Programmé", dot: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700" },
  draft: { label: "Brouillon", dot: "bg-gray-300", bg: "bg-gray-50", text: "text-gray-500" },
};

// ── Dropdown ──
function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { key: string; label: string; icon?: ReactNode }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.key === value);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}>
        {label}: {selected?.label}
        <ChevronDown />
      </button>

      {open && (
        <div>
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Options propres ──
const networkOptions = [
  { key: "all", label: "Tous" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
  { key: "linkedin", label: "LinkedIn" },
];

const statusOptions = [
  { key: "all", label: "Tous" },
  { key: "published", label: "Publié" },
  { key: "scheduled", label: "Programmé" },
  { key: "draft", label: "Brouillon" },
];

// ── Post Card ──
function PostCard({ post }: { post: CalendarPost }) {
  const status = statusConfig[post.status];

  return (
    <div className={`${status.bg}`}>
      {post.title}
    </div>
  );
}

// ── Main ──
export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
  const [networkFilter, setNetworkFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getCalendarDays(year, month);
  const mockPosts = getMockPosts();

  function getFilteredPosts(key: string): CalendarPost[] {
    const posts = mockPosts[key] || [];

    return posts.filter((p) => {
      const networkMatch =
        networkFilter === "all" || networkFilter === p.network;

      const statusMatch =
        statusFilter === "all" || statusFilter === p.status;

      return networkMatch && statusMatch;
    });
  }

  return (
    <div>
      <FilterDropdown
        label="Réseau"
        value={networkFilter}
        options={networkOptions}
        onChange={setNetworkFilter}
      />

      <FilterDropdown
        label="Statut"
        value={statusFilter}
        options={statusOptions}
        onChange={setStatusFilter}
      />

      <div className="grid grid-cols-7">
        {days.map((item) => {
          const key = dateKey(item.date);
          const posts = getFilteredPosts(key);

          return (
            <div key={key}>
              {item.date.getDate()}

              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
