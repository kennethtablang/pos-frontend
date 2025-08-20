/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/pages/inventory/InventoryTransactionsPage.tsx */
import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCcw,
  Plus,
  Trash2,
  Search as SearchIcon,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";

import { inventoryTransactionService } from "@/services/inventoryTransactionService";
import { productService } from "@/services/productService";
import {
  type InventoryTransactionReadDto,
  type InventoryTransactionCreateDto,
  InventoryActionType,
} from "@/types/inventoryTransaction";
import type { ProductReadDto } from "@/types/product";

import ConfirmDeleteModal from "@/components/common/DeleteConfirmationModal";
import CreateTransactionModal from "@/components/inventory/transactions/CreateTransactionsModal";
import ViewTransactionModal from "@/components/inventory/transactions/ViewTransactionModal";

const ACTION_LABELS: Record<InventoryActionType, string> = {
  [InventoryActionType.StockIn]: "Stock In",
  [InventoryActionType.Sale]: "Sale",
  [InventoryActionType.Return]: "Return",
  [InventoryActionType.Transfer]: "Transfer",
  [InventoryActionType.Adjustment]: "Adjustment",
  [InventoryActionType.BadOrder]: "Bad Order",
  [InventoryActionType.VoidedSale]: "Voided Sale",
};

export default function InventoryTransactionsPage() {
  const [transactions, setTransactions] = useState<
    InventoryTransactionReadDto[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [products, setProducts] = useState<ProductReadDto[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState<number | "">("");
  const [actionFilter, setActionFilter] = useState<InventoryActionType | "">(
    ""
  );
  const [fromDate, setFromDate] = useState<string | "">("");
  const [toDate, setToDate] = useState<string | "">("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // View modal
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewTransaction, setViewTransaction] =
    useState<InventoryTransactionReadDto | null>(null);

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await inventoryTransactionService.getAll(
        productFilter === "" ? undefined : (productFilter as number),
        actionFilter === "" ? undefined : (actionFilter as InventoryActionType),
        fromDate ? new Date(fromDate).toISOString() : undefined,
        toDate ? new Date(toDate).toISOString() : undefined
      );
      setTransactions(data);
      setPage(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const p = await productService.getAll();
      setProducts(p);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pagination / pageItems
  const total = transactions.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return transactions.slice(start, start + pageSize);
  }, [transactions, page]);

  const filteredProducts = useMemo(() => {
    const t = productSearch.trim().toLowerCase();
    if (!t) return products.slice(0, 50);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          (p.barcode ?? "").toLowerCase().includes(t)
      )
      .slice(0, 50);
  }, [products, productSearch]);

  // Create handler
  const handleCreate = async (dto: InventoryTransactionCreateDto) => {
    try {
      await inventoryTransactionService.create(dto);
      toast.success("Transaction created");
      setIsCreateOpen(false);
      await fetchTransactions();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data ?? "Failed to create transaction");
    }
  };

  // View handler
  const openView = (t: InventoryTransactionReadDto) => {
    setViewTransaction(t);
    setIsViewOpen(true);
  };

  const closeView = () => {
    setIsViewOpen(false);
    setViewTransaction(null);
  };

  // Delete
  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await inventoryTransactionService.delete(id);
      toast.success("Transaction deleted");
      await fetchTransactions();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data ?? "Failed to delete transaction");
    }
  };

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Inventory Transactions
          </h1>
          <p className="text-sm text-gray-500">
            View inventory movements (stock in / sales / adjustments / bad
            orders).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fetchTransactions()}
            disabled={loading}
            aria-label="Refresh transactions"
            title="Refresh"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>

          <button
            className="btn btn-primary btn-sm gap-2"
            onClick={() => setIsCreateOpen(true)}
            aria-label="Add inventory transaction"
            title="Add Transaction"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label htmlFor="productFilter" className="sr-only">
            Filter by product
          </label>
          <div className="relative">
            <input
              id="productFilter"
              type="text"
              placeholder="Filter by product (search...)"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setProductFilter("");
              }}
              className="input input-sm input-bordered w-full pr-10"
              aria-label="Search product"
            />
            <div className="absolute right-2 top-2">
              <SearchIcon className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* suggestions */}
          {productSearch.trim() !== "" && (
            <div className="border rounded max-h-56 overflow-auto bg-white mt-1 z-10">
              {filteredProducts.length === 0 ? (
                <div className="p-2 text-sm text-gray-500">No products</div>
              ) : (
                filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 cursor-pointer hover:bg-base-200"
                    onClick={() => {
                      setProductFilter(p.id);
                      setProductSearch(p.name);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setProductFilter(p.id);
                        setProductSearch(p.name);
                      }
                    }}
                    title={`${p.name} (${p.barcode ?? "—"})`}
                  >
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.barcode ?? "—"} • {p.categoryName ?? "—"}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="actionFilter" className="text-sm text-gray-600">
            Action
          </label>
          <select
            id="actionFilter"
            className="select select-sm select-bordered w-full"
            value={actionFilter === "" ? "" : String(actionFilter)}
            onChange={(e) =>
              setActionFilter(
                e.target.value === ""
                  ? ""
                  : (Number(e.target.value) as InventoryActionType)
              )
            }
            aria-label="Filter by action type"
            title="Filter by action"
          >
            <option value="">All actions</option>
            {Object.keys(ACTION_LABELS).map((k) => {
              const keyNum = Number(k) as InventoryActionType;
              return (
                <option key={k} value={String(keyNum)}>
                  {ACTION_LABELS[keyNum]}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label htmlFor="fromDate" className="text-sm text-gray-600">
            From
          </label>
          <input
            id="fromDate"
            type="date"
            className="input input-sm input-bordered w-full"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            aria-label="From date"
          />
        </div>

        <div>
          <label htmlFor="toDate" className="text-sm text-gray-600">
            To
          </label>
          <input
            id="toDate"
            type="date"
            className="input input-sm input-bordered w-full"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            aria-label="To date"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No transactions found.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit Cost</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Ref</th>
                <th className="px-3 py-2">By</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((t) => (
                <tr key={t.id}>
                  <td className="px-3 py-2">
                    {new Intl.DateTimeFormat(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(t.transactionDate))}
                  </td>
                  <td className="px-3 py-2 text-left">
                    {t.productName ?? `#${t.productId}`}
                  </td>
                  <td className="px-3 py-2 text-right">{t.quantity}</td>
                  <td className="px-3 py-2 text-right">
                    {t.unitCost != null ? t.unitCost.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2">{ACTION_LABELS[t.actionType]}</td>
                  <td className="px-3 py-2">{t.referenceNumber ?? "—"}</td>
                  <td className="px-3 py-2">
                    {t.performedByUserName ?? t.performedByUserId ?? "—"}
                  </td>
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      className="btn btn-xs"
                      title="View transaction"
                      aria-label={`View transaction ${t.id}`}
                      onClick={() => openView(t)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => confirmDelete(t.id)}
                      aria-label={`Delete transaction ${t.id}`}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {total === 0
            ? "0 transactions"
            : `${(page - 1) * pageSize + 1}–${Math.min(
                page * pageSize,
                total
              )} of ${total}`}
        </div>

        <div className="btn-group">
          <button
            className="btn btn-xs"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            className="btn btn-xs"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Modal */}
      <CreateTransactionModal
        products={products}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />

      {/* View Modal */}
      <ViewTransactionModal
        isOpen={isViewOpen}
        transaction={viewTransaction}
        onClose={closeView}
      />

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        title="Delete transaction"
        message="Are you sure you want to delete this inventory transaction?"
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingId(null);
        }}
        onConfirm={async () => {
          if (deletingId != null) {
            await handleDelete(deletingId);
            setIsDeleteOpen(false);
            setDeletingId(null);
          }
        }}
      />
    </section>
  );
}
