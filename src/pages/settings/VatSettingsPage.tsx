// src/pages/settings/VatSettingsPage.tsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { PercentCircle, Pencil, Plus } from "lucide-react";
import toast from "react-hot-toast";
import type { VatSettingReadDto } from "@/types/vatSetting";
import { vatSettingService } from "@/services/vatSettingService";
import { AddVatModal } from "@/components/settings/vat/AddVatModal";
import { EditVatModal } from "@/components/settings/vat/EditVatModal";
import { TaxTypeLabels } from "@/types/vatSetting";

export default function VatSettingsPage() {
  const [settings, setSettings] = useState<VatSettingReadDto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<VatSettingReadDto | null>(null);

  // For the confirm-deactivate modal
  const [confirmTarget, setConfirmTarget] = useState<VatSettingReadDto | null>(
    null
  );

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vatSettingService.getAll();
      setSettings(data);
    } catch {
      toast.error("Failed to fetch VAT settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const filteredSettings = useMemo(() => {
    const term = search.toLowerCase();
    return settings.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.rate.toString().includes(term) ||
        TaxTypeLabels[s.taxType].toLowerCase().includes(term)
    );
  }, [search, settings]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleEdit = useCallback((vat: VatSettingReadDto) => {
    setSelected(vat);
    setIsEditOpen(true);
  }, []);

  // Open confirm modal
  const promptDeactivate = useCallback((vat: VatSettingReadDto) => {
    if (!vat.isActive) return; // already inactive
    setConfirmTarget(vat);
  }, []);

  // Actual deactivate action
  const performDeactivate = useCallback(async () => {
    if (!confirmTarget) return;
    setLoading(true);
    try {
      await vatSettingService.setActive(confirmTarget.id, false);
      toast.success("VAT setting deactivated.");
      await fetchSettings();
    } catch {
      toast.error("Failed to deactivate setting.");
    } finally {
      setLoading(false);
      setConfirmTarget(null);
    }
  }, [confirmTarget, fetchSettings]);

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <PercentCircle className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">VAT Settings</h1>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn btn-primary btn-sm gap-2"
          disabled={loading}
        >
          <Plus className="w-4 h-4" /> Add VAT
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-xs">
        <input
          type="text"
          placeholder="Search by name or type"
          value={search}
          onChange={handleSearch}
          className="input input-sm input-bordered w-full"
        />
      </div>

      {/* Add & Edit Modals */}
      <AddVatModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onVatAdded={async () => {
          setIsAddOpen(false);
          await fetchSettings();
        }}
      />
      {selected && (
        <EditVatModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelected(null);
          }}
          vatSetting={selected}
          onVatUpdated={async () => {
            setIsEditOpen(false);
            setSelected(null);
            await fetchSettings();
          }}
        />
      )}

      {/* Confirm Deactivate Modal */}
      <dialog className={`modal ${confirmTarget ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Deactivation</h3>
          <p className="py-4">
            Are you sure you want to deactivate{" "}
            <strong>{confirmTarget?.name}</strong>?
          </p>
          <div className="modal-action">
            <button
              className="btn btn-error"
              onClick={performDeactivate}
              disabled={loading}
            >
              Yes, Deactivate
            </button>
            <button className="btn" onClick={() => setConfirmTarget(null)}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading settings...
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No VAT settings found.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Rate (%)</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Inclusive</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSettings.map((vat) => (
                <tr key={vat.id} className="hover">
                  <td className="px-4 py-2">{vat.name}</td>
                  <td className="px-4 py-2">{vat.rate}</td>
                  <td className="px-4 py-2">{TaxTypeLabels[vat.taxType]}</td>
                  <td className="px-4 py-2">
                    {vat.isVatInclusive ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`badge badge-sm ${
                        vat.isActive ? "badge-success" : "badge-error"
                      }`}
                    >
                      {vat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(vat)}
                      className="btn btn-xs btn-outline btn-secondary gap-1"
                      disabled={loading}
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => promptDeactivate(vat)}
                      className="btn btn-xs btn-outline btn-error"
                      disabled={!vat.isActive || loading}
                    >
                      Deactivate
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
