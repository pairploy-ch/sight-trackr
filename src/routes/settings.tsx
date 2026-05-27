import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "ตั้งค่า — MARINA OPTICAL" }],
  }),
  component: SettingsPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryKey =
  | "lensTypes"
  | "brands"
  | "models"
  | "indexes"
  | "coatings"
  | "colors";

interface Item {
  id: number;
  name: string;
}

interface SettingsData {
  lensTypes: Item[];
  brands:    Item[];
  models:    Item[];
  indexes:   Item[];
  coatings:  Item[];
  colors:    Item[];
}

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  lensTypes: "ประเภทเลนส์",
  brands:    "ยี่ห้อเลนส์",
  models:    "รุ่นเลนส์",
  indexes:   "ดัชนีหักเห (Index)",
  coatings:  "สารเคลือบเลนส์ (Coating)",
  colors:    "สีเลนส์",
};

const CATEGORY_PLACEHOLDER: Record<CategoryKey, string> = {
  lensTypes: "เช่น PROGRESSIVE, SINGLE VISION...",
  brands:    "เช่น RODENSTOCK, HOYA, ZEISS...",
  models:    "เช่น PROGRESSIVE Individual 2...",
  indexes:   "เช่น 1.56, 1.60, 1.67...",
  coatings:  "เช่น Multicoat + Blue Light...",
  colors:    "เช่น Clear, Brown, Grey...",
};

// ─── Initial data ─────────────────────────────────────────────────────────────

const INITIAL: SettingsData = {
  lensTypes: [
    { id: 1, name: "PROGRESSIVE (Progressive Addition Lens)" },
    { id: 2, name: "SINGLE VISION" },
    { id: 3, name: "BIFOCAL" },
    { id: 4, name: "OFFICE LENS" },
  ],
  brands: [
    { id: 1, name: "RODENSTOCK" },
    { id: 2, name: "HOYA" },
    { id: 3, name: "ZEISS" },
    { id: 4, name: "NIKON" },
    { id: 5, name: "ESSILOR" },
  ],
  models: [
    { id: 1, name: "PROGRESSIVE Individual 2" },
    { id: 2, name: "PROGRESSIVE Multigressiv MyView" },
    { id: 3, name: "HOYA Harmony 3" },
    { id: 4, name: "ZEISS Progressive Individual" },
  ],
  indexes: [
    { id: 1, name: "1.50" },
    { id: 2, name: "1.56" },
    { id: 3, name: "1.60" },
    { id: 4, name: "1.67" },
    { id: 5, name: "1.74" },
  ],
  coatings: [
    { id: 1, name: "Multicoat + Blue Light" },
    { id: 2, name: "Photochromic" },
    { id: 3, name: "Transition" },
    { id: 4, name: "Anti-Reflection" },
    { id: 5, name: "Hardcoat" },
  ],
  colors: [
    { id: 1, name: "Clear" },
    { id: 2, name: "Brown" },
    { id: 3, name: "Grey" },
    { id: 4, name: "Green" },
    { id: 5, name: "Blue" },
  ],
};

// ─── Inline Edit/Add Modal ────────────────────────────────────────────────────

function ItemModal({
  categoryLabel,
  initial,
  onSave,
  onClose,
}: {
  categoryLabel: string;
  initial: Item | null;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [error, setError] = useState("");

  function handleSave() {
    if (!name.trim()) { setError("กรุณากรอกข้อมูล"); return; }
    onSave(name.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-xl mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm">
            {initial ? `แก้ไข ${categoryLabel}` : `เพิ่ม ${categoryLabel}`}
          </h2>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-secondary text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <label className="text-sm text-muted-foreground">{categoryLabel}</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder={CATEGORY_PLACEHOLDER[
              Object.keys(CATEGORY_LABELS).find(
                (k) => CATEGORY_LABELS[k as CategoryKey] === categoryLabel
              ) as CategoryKey
            ]}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            <Save className="h-4 w-4" /> บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  name,
  onConfirm,
  onClose,
}: {
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-xl mx-4 p-6 space-y-4">
        <h2 className="font-semibold text-foreground">ยืนยันการลบ</h2>
        <p className="text-sm text-muted-foreground">
          ต้องการลบ{" "}
          <span className="font-medium text-foreground">"{name}"</span>{" "}
          ออกจากระบบ?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" /> ลบ
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────

function CategorySection({
  categoryKey,
  items,
  onAdd,
  onEdit,
  onDelete,
}: {
  categoryKey: CategoryKey;
  items: Item[];
  onAdd: (name: string) => void;
  onEdit: (id: number, name: string) => void;
  onDelete: (id: number) => void;
}) {
  const label = CATEGORY_LABELS[categoryKey];
  const [open, setOpen]       = useState(true);
  const [modal, setModal]     = useState<"add" | Item | null>(null);
  const [delItem, setDelItem] = useState<Item | null>(null);

  function handleSave(name: string) {
    if (modal === "add") onAdd(name);
    else if (modal && typeof modal === "object") onEdit(modal.id, name);
    setModal(null);
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between px-5 py-4 bg-secondary/40 hover:bg-secondary/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            {open
              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground" />
            }
            <span className="font-semibold text-sm text-foreground">{label}</span>
            <span className="rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5">
              {items.length} รายการ
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setModal("add"); }}
            className="flex items-center gap-1.5 rounded-lg border border-primary text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary/5"
          >
            <Plus className="h-3.5 w-3.5" /> เพิ่ม
          </button>
        </button>

        {/* List */}
        {open && (
          <div>
            {items.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                ยังไม่มีข้อมูล — กด "เพิ่ม" เพื่อเพิ่มรายการ
              </div>
            ) : (
              <ul>
                {items.map((item, i) => (
                  <li
                    key={item.id}
                    className={`flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors
                      ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                      <span className="text-sm text-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModal(item)}
                        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-secondary flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" /> แก้ไข
                      </button>
                      <button
                        onClick={() => setDelItem(item)}
                        className="rounded-md border border-destructive/30 text-destructive px-2 py-1 text-xs hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {modal !== null && (
        <ItemModal
          categoryLabel={label}
          initial={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {delItem && (
        <DeleteConfirm
          name={delItem.name}
          onConfirm={() => { onDelete(delItem.id); setDelItem(null); }}
          onClose={() => setDelItem(null)}
        />
      )}
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function SettingsPage() {
  const [data, setData] = useState<SettingsData>(INITIAL);

  function nextId(items: Item[]) {
    return Math.max(0, ...items.map((i) => i.id)) + 1;
  }

  function handleAdd(key: CategoryKey, name: string) {
    setData((prev) => ({
      ...prev,
      [key]: [...prev[key], { id: nextId(prev[key]), name }],
    }));
  }

  function handleEdit(key: CategoryKey, id: number, name: string) {
    setData((prev) => ({
      ...prev,
      [key]: prev[key].map((item) => (item.id === id ? { ...item, name } : item)),
    }));
  }

  function handleDelete(key: CategoryKey, id: number) {
    setData((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => item.id !== id),
    }));
  }

  const categories = Object.keys(CATEGORY_LABELS) as CategoryKey[];

  return (
    <AppShell title="ตั้งค่า" subtitle="จัดการข้อมูลพื้นฐานในระบบ">
      <div className="p-6 space-y-4 max-w-3xl">
        <p className="text-sm text-muted-foreground">
          ข้อมูลที่ตั้งค่าที่นี่จะถูกนำไปใช้ใน dropdown ของฟอร์มใบงานทั้งหมด
        </p>
        {categories.map((key) => (
          <CategorySection
            key={key}
            categoryKey={key}
            items={data[key]}
            onAdd={(name) => handleAdd(key, name)}
            onEdit={(id, name) => handleEdit(key, id, name)}
            onDelete={(id) => handleDelete(key, id)}
          />
        ))}
      </div>
    </AppShell>
  );
}