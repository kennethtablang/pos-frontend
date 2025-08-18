// src/pages/inventory/ProductListPage.tsx
import { useEffect, useState } from "react";
import { Package, Plus, Pencil, Image } from "lucide-react";
import toast from "react-hot-toast";
import { productService } from "@/services/productService";
import type { ProductReadDto } from "@/types/product";
import { AddProductModal } from "@/components/inventory/product/AddProductModal";
import { EditProductModal } from "@/components/inventory/product/EditProductModal";

export default function ProductListPage() {
  const [products, setProducts] = useState<ProductReadDto[]>([]);
  const [filtered, setFiltered] = useState<ProductReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<ProductReadDto | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    toast.success("Navigated to Products");
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    setFiltered(
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.barcode ?? "").toLowerCase().includes(term) ||
          (p.categoryName ?? "").toLowerCase().includes(term) ||
          (p.unitName ?? "").toLowerCase().includes(term) ||
          p.price.toString().includes(term) ||
          p.taxType.toString().toLowerCase().includes(term) ||
          (p.isPerishable ? "perishable" : "non-perishable").includes(term) ||
          (p.isActive ? "active" : "inactive").includes(term)
      )
    );
  };

  const openEdit = (item: ProductReadDto) => {
    setSelected(item);
    setIsEditOpen(true);
  };

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Products</h1>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn btn-primary btn-sm gap-2"
          disabled={loading}
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearch}
          className="input input-sm input-bordered w-full"
        />
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onProductAdded={fetchProducts}
      />
      {selected && (
        <EditProductModal
          isOpen={isEditOpen}
          product={selected}
          onClose={() => {
            setIsEditOpen(false);
            setSelected(null);
          }}
          onProductUpdated={fetchProducts}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No products found.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">On Hand</th>
                <th className="px-4 py-2 text-left">Barcode</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Unit</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Tax</th>
                <th className="px-4 py-2 text-left">Perishable</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="hover">
                  <td className="px-4 py-2">
                    {p.imageBase64 ? (
                      <img
                        src={`data:image/png;base64,${p.imageBase64}`}
                        alt={p.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <Image className="w-6 h-6 text-gray-400" />
                    )}
                  </td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.onHand}</td>
                  <td className="px-4 py-2">{p.barcode || "—"}</td>
                  <td className="px-4 py-2">{p.categoryName || "—"}</td>
                  <td className="px-4 py-2">{p.unitName || "—"}</td>
                  <td className="px-4 py-2">{p.price.toFixed(2)}</td>
                  <td className="px-4 py-2">{p.taxType}</td>
                  <td className="px-4 py-2">{p.isPerishable ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`badge badge-sm ${
                        p.isActive ? "badge-success" : "badge-error"
                      }`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
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
