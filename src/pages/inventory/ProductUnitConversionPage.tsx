/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/inventory/ProductUnitConversionPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, Plus, FileText } from "lucide-react";
import toast from "react-hot-toast";

import { productService } from "@/services/productService";
import { unitService } from "@/services/unitService";
import { productUnitConversionService } from "@/services/productUnitConversionService";

import type { ProductReadDto } from "@/types/product";
import type { UnitReadDto } from "@/types/unit";
import type { ProductUnitConversionReadDto } from "@/types/productUnitConversion";

import AddProductUnitConversion from "@/components/inventory/productunitconversion/AddProductUnitConversion";
import EditProductUnitConversion from "@/components/inventory/productunitconversion/EditProductUnitConversion";

export default function ProductUnitConversionPage() {
  // Master: products
  const [products, setProducts] = useState<ProductReadDto[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [productPageSize] = useState(12); // small grid/list size

  // Detail: selected product and its conversions
  const [selectedProduct, setSelectedProduct] = useState<ProductReadDto | null>(
    null
  );
  const [conversions, setConversions] = useState<
    ProductUnitConversionReadDto[]
  >([]);
  const [conversionsLoading, setConversionsLoading] = useState(false);

  // Units (used by modals)
  const [units, setUnits] = useState<UnitReadDto[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);

  // Modal UI
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedConversion, setSelectedConversion] =
    useState<ProductUnitConversionReadDto | null>(null);

  // --- Fetch products (master list).
  // NOTE: For huge catalogs, replace this with server-side paged/search API.
  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const p = await productService.getAll();
      setProducts(p);
      // auto-select first product when none selected
      if (!selectedProduct && p.length > 0) setSelectedProduct(p[0]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products.");
    } finally {
      setProductLoading(false);
    }
  };

  // Fetch units once (for add/edit dropdowns)
  const fetchUnits = async () => {
    setUnitsLoading(true);
    try {
      const u = await unitService.getAll();
      setUnits(u);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load units.");
    } finally {
      setUnitsLoading(false);
    }
  };

  // Fetch conversions for selected product (detail)
  const fetchConversionsForProduct = async (productId?: number) => {
    if (!productId) {
      setConversions([]);
      return;
    }
    setConversionsLoading(true);
    try {
      const list = await productUnitConversionService.getByProductId(productId);
      setConversions(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load conversions.");
    } finally {
      setConversionsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchUnits();
    // subtle navigation toast
    toast.success("Navigated to Unit Conversions");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When selectedProduct changes, load its conversions
  useEffect(() => {
    fetchConversionsForProduct(selectedProduct?.id);
  }, [selectedProduct]);

  // --- Product list filtering & pagination (client-side)
  const filteredProducts = useMemo(() => {
    const t = productSearch.trim().toLowerCase();
    if (!t) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(t) ||
        (p.barcode ?? "").toLowerCase().includes(t) ||
        (p.categoryName ?? "").toLowerCase().includes(t)
    );
  }, [products, productSearch]);

  const productTotal = filteredProducts.length;
  const productTotalPages = Math.max(
    1,
    Math.ceil(productTotal / productPageSize)
  );
  useEffect(() => {
    if (productPage > productTotalPages) setProductPage(1);
  }, [productTotalPages, productPage]);

  const productPageItems = useMemo(() => {
    const start = (productPage - 1) * productPageSize;
    return filteredProducts.slice(start, start + productPageSize);
  }, [filteredProducts, productPage, productPageSize]);

  // --- Actions
  const refreshSelectedProduct = async () => {
    if (!selectedProduct) return;
    await fetchConversionsForProduct(selectedProduct.id);
    toast.success("Conversions refreshed");
  };

  const handleSelectProduct = (product: ProductReadDto) => {
    setSelectedProduct(product);
    setProductPage(1); // reset page optionally
  };

  const handleDeleteConversion = async (id: number) => {
    if (!confirm("Delete conversion? This action cannot be undone.")) return;
    try {
      await productUnitConversionService.delete(id);
      toast.success("Conversion deleted");
      await fetchConversionsForProduct(selectedProduct?.id);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ?? "Failed to delete conversion."
      );
    }
  };

  const exportConversionsCsv = () => {
    if (!selectedProduct) return;
    if (conversions.length === 0) {
      toast("No conversions to export", { icon: "ℹ️" });
      return;
    }

    // simple CSV creation
    const rows = [
      ["Product", "From Unit", "To Unit", "Conversion Rate", "Notes"],
      ...conversions.map((c) => [
        selectedProduct?.name ?? c.productId.toString(),
        c.fromUnitName ?? c.fromUnitId.toString(),
        c.toUnitName ?? c.toUnitId.toString(),
        c.conversionRate.toString(),
        c.notes ?? "",
      ]),
    ];

    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedProduct?.name ?? "conversions"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast.success("Export started");
  };

  // --- Render
  return (
    <section className="p-6">
      <div className="flex gap-6">
        {/* Left Pane: Product Master */}
        <aside className="w-80 border border-base-300 rounded-lg p-3 bg-base-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="input input-sm input-bordered w-full"
              />
            </div>

            <button
              onClick={() => {
                fetchProducts();
                toast.success("Products refreshed");
              }}
              className="btn btn-ghost btn-sm"
              disabled={productLoading}
              title="Refresh products"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Product list */}
          <div className="overflow-auto h-[60vh]">
            {productLoading ? (
              <div className="text-sm text-gray-500 p-4">
                Loading products...
              </div>
            ) : productPageItems.length === 0 ? (
              <div className="text-sm text-gray-500 p-4">
                No products found.
              </div>
            ) : (
              <ul className="space-y-1">
                {productPageItems.map((p) => {
                  const active = selectedProduct?.id === p.id;
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => handleSelectProduct(p)}
                        className={`w-full text-left p-2 rounded-md flex items-center justify-between ${
                          active
                            ? "bg-primary/10 border border-primary"
                            : "hover:bg-base-200"
                        }`}
                      >
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-500">
                            {p.categoryName ?? "—"}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.isActive ? "Active" : "Inactive"}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-gray-600">
              {productTotal === 0
                ? "0 products"
                : `${Math.min((productPage - 1) * productPageSize + 1, productTotal)}–${Math.min(productPage * productPageSize, productTotal)} of ${productTotal}`}
            </div>

            <div className="btn-group">
              <button
                className="btn btn-xs"
                onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                disabled={productPage === 1}
              >
                Prev
              </button>
              <button
                className="btn btn-xs"
                onClick={() =>
                  setProductPage((p) => Math.min(productTotalPages, p + 1))
                }
                disabled={productPage === productTotalPages}
              >
                Next
              </button>
            </div>
          </div>

          {/* NOTE: For very large lists you can replace the above list with react-window virtualization:
              - render a FixedSizeList with itemCount = filteredProducts.length
              - and memoize item renderer
              This avoids client-side paging and keeps UX snappy for thousands of rows. */}
        </aside>

        {/* Right Pane: Detail / conversions for selected product */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">
                {selectedProduct ? selectedProduct.name : "Select a product"}
              </h2>
              <div className="text-sm text-gray-500">
                {selectedProduct
                  ? `Category: ${selectedProduct.categoryName ?? "—"}`
                  : "Pick a product from the left"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={refreshSelectedProduct}
                disabled={!selectedProduct || conversionsLoading}
                title="Refresh conversions"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={exportConversionsCsv}
                disabled={!selectedProduct || conversions.length === 0}
                title="Export CSV"
              >
                <FileText className="w-4 h-4" /> Export
              </button>

              <button
                className="btn btn-primary btn-sm gap-2"
                onClick={() => setIsAddOpen(true)}
                disabled={!selectedProduct || unitsLoading}
                title="Add conversion for selected product"
              >
                <Plus className="w-4 h-4" /> Add Conversion
              </button>
            </div>
          </div>

          {/* conversions table */}
          <div className="rounded-lg border border-base-300 overflow-x-auto">
            {conversionsLoading ? (
              <div className="p-6 text-center text-gray-500">
                Loading conversions...
              </div>
            ) : !selectedProduct ? (
              <div className="p-6 text-center text-gray-500">
                Select a product to view conversions.
              </div>
            ) : conversions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No conversions for this product.
              </div>
            ) : (
              <table className="table table-zebra table-sm w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className="px-4 py-2 text-left">From Unit</th>
                    <th className="px-4 py-2 text-left">To Unit</th>
                    <th className="px-4 py-2 text-left">Rate</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((c) => (
                    <tr key={c.id} className="hover">
                      <td className="px-4 py-2">
                        {c.fromUnitName ?? `#${c.fromUnitId}`}
                      </td>
                      <td className="px-4 py-2">
                        {c.toUnitName ?? `#${c.toUnitId}`}
                      </td>
                      <td className="px-4 py-2">{c.conversionRate}</td>
                      <td className="px-4 py-2">{c.notes ?? "—"}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          className="btn btn-xs btn-outline btn-secondary"
                          onClick={() => {
                            setSelectedConversion(c);
                            setIsEditOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-xs btn-outline btn-error"
                          onClick={() => handleDeleteConversion(c.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit modals scoped to selected product */}
      {selectedProduct && (
        <AddProductUnitConversion
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onCreated={async () => {
            setIsAddOpen(false);
            await fetchConversionsForProduct(selectedProduct?.id);
          }}
          // pass minimal product list and units - add modal will use the selected product if you want
          productId={selectedProduct.id} // ✅ passing the ID
          productName={selectedProduct.name} // ✅ passing the name
          units={units}
        />
      )}

      {selectedConversion && selectedProduct && (
        <EditProductUnitConversion
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedConversion(null);
          }}
          conversion={selectedConversion}
          onUpdated={async () => {
            setIsEditOpen(false);
            setSelectedConversion(null);
            await fetchConversionsForProduct(selectedProduct?.id);
          }}
          products={selectedProduct ? [selectedProduct] : products}
          units={units}
        />
      )}
    </section>
  );
}
