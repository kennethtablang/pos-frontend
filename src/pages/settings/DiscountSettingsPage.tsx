// src/pages/settings/DiscountSettingsPage.tsx
import { useEffect, useState } from "react";
import { Percent, Plus, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { discountSettingService } from "@/services/discountSettingService";
import type { DiscountSettingReadDto } from "@/types/discountSetting";
import { AddDiscountSettingModal } from "@/components/settings/discountsetting/AddDiscountSettingModal";
import { EditDiscountSettingModal } from "@/components/settings/discountsetting/EditDiscountSettingModal";

export default function DiscountSettingsPage() {
  const [settings, setSettings] = useState<DiscountSettingReadDto[]>([]);
  const [filteredSettings, setFilteredSettings] = useState<
    DiscountSettingReadDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<DiscountSettingReadDto | null>(null);

  // Fetch all discount settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await discountSettingService.getAll();
      setSettings(data);
      setFilteredSettings(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch discount settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    toast.success("Navigated to Discount Settings");
  }, []);

  // Search/filter logic
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    setFilteredSettings(
      settings.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.discountPercent.toString().includes(term) ||
          (d.requiresApproval ? "yes" : "no").includes(term)
      )
    );
  };

  // Open edit modal
  const handleEdit = (item: DiscountSettingReadDto) => {
    setSelected(item);
    setIsEditOpen(true);
  };

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Percent className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Discount Settings</h1>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn btn-primary btn-sm gap-2"
          disabled={loading}
        >
          <Plus className="w-4 h-4" /> Add Discount
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-xs">
        <input
          type="text"
          placeholder="Search by name, percent, approval"
          value={search}
          onChange={handleSearch}
          className="input input-sm input-bordered w-full"
        />
      </div>

      {/* Add & Edit Modals */}
      <AddDiscountSettingModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onDiscountAdded={fetchSettings}
      />
      {selected && (
        <EditDiscountSettingModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelected(null);
          }}
          discountSetting={selected}
          onDiscountUpdated={fetchSettings}
        />
      )}

      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading discount settings...
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No discount settings found.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Percent (%)</th>
                <th className="px-4 py-2 text-left">Requires Approval</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSettings.map((d) => (
                <tr key={d.id} className="hover">
                  <td className="px-4 py-2">{d.name}</td>
                  <td className="px-4 py-2">{d.discountPercent.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    {d.requiresApproval ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2">{d.description || "—"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`badge badge-sm ${
                        d.isActive ? "badge-success" : "badge-error"
                      }`}
                    >
                      {d.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(d)}
                      className="btn btn-xs btn-outline btn-secondary gap-1"
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
