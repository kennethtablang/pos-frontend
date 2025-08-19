/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/inventory/ProductListPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Package, Plus, Pencil, Image } from "lucide-react";
import toast from "react-hot-toast";
import { productService } from "@/services/productService";
import type { ProductReadDto } from "@/types/product";
import { AddProductModal } from "@/components/inventory/product/AddProductModal";
import { EditProductModal } from "@/components/inventory/product/EditProductModal";

type SortOption = "all" | "lowFirst" | "onHandAsc" | "onHandDesc";

export default function ProductListPage() {
  const [products, setProducts] = useState<ProductReadDto[]>([]);
  const [filtered, setFiltered] = useState<ProductReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<ProductReadDto | null>(null);

  // New filters / sorters
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>("all");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const openEdit = (item: ProductReadDto) => {
    setSelected(item);
    setIsEditOpen(true);
  };

  // derive categories from loaded products to avoid extra API
  const categories = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of products) {
      // NOTE: assumes product has categoryId and categoryName; if not, adjust
      // If categoryName missing, skip
      const catId = (p as any).categoryId;
      const catName = p.categoryName ?? null;
      if (catId != null && catName) {
        map.set(catId, catName);
      } else if (catName && !map.has(-1)) {
        // fallback grouping -1
        map.set(-1, catName);
      }
    }
    // sort alphabetically
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  // compute filtered products with search/category/low-stock/sort
  useEffect(() => {
    const term = search.trim().toLowerCase();
    let list = products.slice();

    // Category filter
    if (categoryFilter !== "") {
      list = list.filter((p) => {
        const pid = (p as any).categoryId;
        return pid === categoryFilter;
      });
    }

    // Search
    if (term) {
      list = list.filter((p) =>
        (
          p.name +
          " " +
          (p.barcode ?? "") +
          " " +
          (p.categoryName ?? "") +
          " " +
          (p.unitName ?? "")
        )
          .toLowerCase()
          .includes(term)
      );
    }

    // Low stock filter
    if (lowStockOnly) {
      list = list.filter((p) => {
        // treat missing reorderLevel as not low (unless explicitly zero)
        const rl = (p as any).reorderLevel;
        if (rl == null) return false;
        // onHand might be undefined; treat undefined as 0
        const onHand = Number(p.onHand ?? 0);
        return onHand <= Number(rl);
      });
    }

    // Sorting
    if (sortBy === "lowFirst") {
      list.sort((a, b) => {
        const ra = (a as any).reorderLevel ?? Number.POSITIVE_INFINITY;
        const rb = (b as any).reorderLevel ?? Number.POSITIVE_INFINITY;
        const oa = Number(a.onHand ?? 0);
        const ob = Number(b.onHand ?? 0);

        const aLow = oa <= ra ? 0 : 1;
        const bLow = ob <= rb ? 0 : 1;
        if (aLow !== bLow) return aLow - bLow; // low-stock first
        // tiebreaker: lowest onHand first
        return oa - ob;
      });
    } else if (sortBy === "onHandAsc") {
      list.sort((a, b) => Number(a.onHand ?? 0) - Number(b.onHand ?? 0));
    } else if (sortBy === "onHandDesc") {
      list.sort((a, b) => Number(b.onHand ?? 0) - Number(a.onHand ?? 0));
    } // else "all" keep API order

    setFiltered(list);
  }, [products, search, categoryFilter, lowStockOnly, sortBy]);

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Products</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="categoryFilter" className="text-sm text-gray-600">
              Category
            </label>
            <select
              id="categoryFilter"
              className="select select-sm select-bordered"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Low stock only</label>
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              aria-label="Show low stock only"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sortSelect" className="text-sm text-gray-600">
              Sort
            </label>
            <select
              id="sortSelect"
              className="select select-sm select-bordered"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="all">Default</option>
              <option value="lowFirst">Low stock first</option>
              <option value="onHandAsc">On-hand ↑</option>
              <option value="onHandDesc">On-hand ↓</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="btn btn-primary btn-sm gap-2"
            disabled={loading}
            aria-label="Add product"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="w-full max-w-lg">
        <input
          type="text"
          placeholder="Search products (name, barcode, category, unit)..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="input input-sm input-bordered w-full"
          aria-label="Search products"
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
                <th className="px-4 py-2 text-left">Reorder</th>
                <th className="px-4 py-2 text-left">Barcode</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Unit</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Perishable</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const onHand = Number(p.onHand ?? 0);
                const reorder = (p as any).reorderLevel;
                const isLow = reorder != null && onHand <= Number(reorder);
                return (
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

                    <td className="px-4 py-2 flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{p.name}</span>
                        {/* <span className="text-xs text-gray-500">
                          {p.unitName ?? "—"} • {p.categoryName ?? "—"}
                        </span> */}
                      </div>
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span>{onHand}</span>
                        {isLow && (
                          <span className="badge badge-sm badge-warning">
                            Low
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-2">{reorder ?? "—"}</td>
                    <td className="px-4 py-2">{p.barcode || "—"}</td>
                    <td className="px-4 py-2">{p.categoryName || "—"}</td>
                    <td className="px-4 py-2">{p.unitName || "—"}</td>
                    <td className="px-4 py-2">{p.price.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      {p.isPerishable ? "Yes" : "No"}
                    </td>
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
                        aria-label={`Edit product ${p.name}`}
                        title={`Edit ${p.name}`}
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
