import { useEffect, useState } from "react";
import { Truck, Plus, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { supplierService } from "@/services/supplierServices";
import type { SupplierReadDto } from "@/types/supplier";
import { AddSupplierModal } from "@/components/suppliers/AddSupplierModal";
import { EditSupplierModal } from "@/components/suppliers/EditSupplierModal";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierReadDto[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<SupplierReadDto[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<SupplierReadDto | null>(null);

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await supplierService.getAll();
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    toast.success("Navigated to Suppliers");
  }, []);

  // Search/filter suppliers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    setFilteredSuppliers(
      suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.contactPerson?.toLowerCase() || "").includes(term) ||
          (s.email?.toLowerCase() || "").includes(term) ||
          (s.phone?.toLowerCase() || "").includes(term)
      )
    );
  };

  // Open edit modal
  const handleEdit = (supplier: SupplierReadDto) => {
    setSelected(supplier);
    setIsEditOpen(true);
  };

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Suppliers</h1>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn btn-primary btn-sm gap-2"
          disabled={loading}
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-xs">
        <input
          type="text"
          placeholder="Search by name, contact, email, or phone"
          value={search}
          onChange={handleSearch}
          className="input input-sm input-bordered w-full"
        />
      </div>

      {/* Add & Edit Modals */}
      <AddSupplierModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSupplierAdded={fetchSuppliers}
      />
      {selected && (
        <EditSupplierModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelected(null);
          }}
          supplier={selected}
          onSupplierUpdated={fetchSuppliers}
        />
      )}

      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading suppliers...
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No suppliers found.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Contact Person</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((s) => (
                <tr key={s.id} className="hover">
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.contactPerson || "—"}</td>
                  <td className="px-4 py-2">{s.email || "—"}</td>
                  <td className="px-4 py-2">{s.phone || "—"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`badge badge-sm ${
                        s.isActive ? "badge-success" : "badge-error"
                      }`}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(s)}
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
