// src/pages/settings/ReceiptSettingsPage.tsx
import { useEffect, useState, useCallback } from "react";
import { Printer, Plus, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { receiptSettingService } from "@/services/receiptSettingService";
import type { ReceiptSettingReadDto } from "@/types/receiptSetting";
import { AddReceiptModal } from "@/components/settings/receipt/AddReceiptModal";
import { EditReceiptModal } from "@/components/settings/receipt/EditReceiptModal";

export default function ReceiptSettingsPage() {
  const [settings, setSettings] = useState<ReceiptSettingReadDto[]>([]);
  const [filtered, setFiltered] = useState<ReceiptSettingReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<ReceiptSettingReadDto | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await receiptSettingService.getAll();
      setSettings(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch receipt settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    toast.success("Navigated to Receipt Settings");
  }, [fetchSettings]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    setFiltered(
      settings.filter((r) =>
        [r.headerMessage, r.footerMessage, r.receiptSize]
          .map((s) => s?.toLowerCase() ?? "")
          .some((s) => s.includes(term))
      )
    );
  };

  const handleEdit = (r: ReceiptSettingReadDto) => {
    setSelected(r);
    setIsEditOpen(true);
  };

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Printer className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Receipt Settings</h1>
        </div>
        <button
          className="btn btn-primary btn-sm gap-2"
          onClick={() => setIsAddOpen(true)}
          disabled={loading}
        >
          <Plus className="w-4 h-4" /> Add Setting
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-sm">
        <input
          type="text"
          placeholder="Search by header, footer, or size"
          value={search}
          onChange={handleSearch}
          className="input input-sm input-bordered w-full"
        />
      </div>

      {/* Modals */}
      <AddReceiptModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onReceiptAdded={fetchSettings}
      />
      {selected && (
        <EditReceiptModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelected(null);
          }}
          receiptSetting={selected}
          onReceiptUpdated={fetchSettings}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading settings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No receipt settings found.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Header</th>
                <th className="px-4 py-2 text-left">Footer</th>
                <th className="px-4 py-2 text-left">Logo URL</th>
                <th className="px-4 py-2 text-left">Size</th>
                <th className="px-4 py-2 text-left">VAT Breakdown</th>
                <th className="px-4 py-2 text-left">Serial/Permit</th>
                <th className="px-4 py-2 text-left">Item Code</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="hover">
                  <td className="px-4 py-2">{r.headerMessage ?? "—"}</td>
                  <td className="px-4 py-2">{r.footerMessage ?? "—"}</td>
                  <td className="px-4 py-2">{r.logoUrl ?? "—"}</td>
                  <td className="px-4 py-2">{r.receiptSize}</td>
                  <td className="px-4 py-2">
                    {r.showVatBreakdown ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2">
                    {r.showSerialAndPermitNumber ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2">{r.showItemCode ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`badge badge-sm ${
                        r.isActive ? "badge-success" : "badge-error"
                      }`}
                    >
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="btn btn-xs btn-outline btn-secondary gap-1"
                      onClick={() => handleEdit(r)}
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
