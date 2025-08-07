// src/pages/settings/CounterSettingsPage.tsx
import { useEffect, useState, useCallback } from "react";
import { Computer, Plus, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { counterSettingService } from "@/services/counterSettingService";
import type { CounterReadDto } from "@/types/counterSetting";
import { AddCounterModal } from "@/components/settings/counter/AddCounterModal";
import { EditCounterModal } from "@/components/settings/counter/EditCounterModal";

export default function CounterSettingsPage() {
  const [counters, setCounters] = useState<CounterReadDto[]>([]);
  const [filteredCounters, setFilteredCounters] = useState<CounterReadDto[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<CounterReadDto | null>(null);

  const fetchCounters = useCallback(async () => {
    setLoading(true);
    try {
      const data = await counterSettingService.getAll();
      setCounters(data);
      setFilteredCounters(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch counters.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounters();
    toast.success("Navigated to Counter Settings");
  }, [fetchCounters]);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value.toLowerCase();
      setSearch(term);
      setFilteredCounters(
        counters.filter(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            (c.description ?? "").toLowerCase().includes(term) ||
            (c.terminalIdentifier ?? "").toLowerCase().includes(term)
        )
      );
    },
    [counters]
  );

  const handleEdit = useCallback((counter: CounterReadDto) => {
    setSelected(counter);
    setIsEditOpen(true);
  }, []);

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Computer className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">List of Counters</h1>
        </div>
        <button
          className="btn btn-primary btn-sm gap-2"
          onClick={() => setIsAddOpen(true)}
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
          Add Counter
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-xs">
        <input
          type="text"
          placeholder="Search by name, description or terminal"
          value={search}
          onChange={handleSearch}
          className="input input-sm input-bordered w-full"
        />
      </div>

      {/* Modals */}
      <AddCounterModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCounterAdded={fetchCounters}
      />
      {selected && (
        <EditCounterModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelected(null);
          }}
          counter={selected}
          onCounterUpdated={fetchCounters}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading counters...
          </div>
        ) : filteredCounters.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No counters found.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Terminal ID</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Updated</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCounters.map((c) => (
                <tr key={c.id} className="hover">
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.description ?? "—"}</td>
                  <td className="px-4 py-2">{c.terminalIdentifier ?? "—"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`badge badge-sm ${
                        c.isActive ? "badge-success" : "badge-error"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="btn btn-xs btn-outline btn-secondary gap-1"
                      onClick={() => handleEdit(c)}
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
