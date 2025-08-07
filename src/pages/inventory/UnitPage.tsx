// src/pages/inventory/UnitPage.tsx
import { useEffect, useState } from "react";
import { Box, Plus, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { unitService } from "@/services/unitService";
import type { UnitReadDto } from "@/types/unit";
import { AddUnitModal } from "@/components/inventory/unit/AddUnitModal";
import { EditUnitModal } from "@/components/inventory/unit/EditUnitModal";

export default function UnitPage() {
  const [units, setUnits] = useState<UnitReadDto[]>([]);
  const [filtered, setFiltered] = useState<UnitReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<UnitReadDto | null>(null);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = await unitService.getAll();
      setUnits(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch units.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    toast.success("Navigated to Units");
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    setFiltered(
      units.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          (u.abbreviation ?? "").toLowerCase().includes(term) ||
          (u.unitType ?? "").toLowerCase().includes(term) ||
          (u.allowsDecimal ? "decimal" : "integer").includes(term) ||
          (u.isActive ? "active" : "inactive").includes(term)
      )
    );
  };

  const openEdit = (item: UnitReadDto) => {
    setSelected(item);
    setIsEditOpen(true);
  };

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Units</h1>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn btn-primary btn-sm gap-2"
          disabled={loading}
        >
          <Plus className="w-4 h-4" /> Add Unit
        </button>
      </div>

      {/* Search */}
      <div className="w-full max-w-xs">
        <input
          type="text"
          placeholder="Search units..."
          value={search}
          onChange={handleSearch}
          className="input input-sm input-bordered w-full"
        />
      </div>

      {/* Modals */}
      <AddUnitModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onUnitAdded={fetchUnits}
      />
      {selected && (
        <EditUnitModal
          isOpen={isEditOpen}
          unit={selected}
          onClose={() => {
            setIsEditOpen(false);
            setSelected(null);
          }}
          onUnitUpdated={fetchUnits}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading units...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No units found.</div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Abbreviation</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="hover">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.abbreviation || "—"}</td>
                  <td className="px-4 py-2">{u.unitType || "—"}</td>
                  <td className="px-4 py-2">
                    {u.allowsDecimal ? "Decimal" : "Integer"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`badge badge-sm ${
                        u.isActive ? "badge-success" : "badge-error"
                      }`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => openEdit(u)}
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
