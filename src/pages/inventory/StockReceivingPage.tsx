/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/pages/inventory/StockReceivingPage.tsx */
import React, { useEffect, useMemo, useState } from "react";
import { Search, Download, Eye, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { purchaseOrderService } from "@/services/purchaseOrderService";
import { supplierService } from "@/services/supplierServices";
import type {
  PurchaseOrderReadDto,
  ReceivedStockReadDto,
} from "@/types/purchaseOrder";
import type { SupplierReadDto } from "@/types/supplier";

export default function StockReceivingPage() {
  const [orders, setOrders] = useState<PurchaseOrderReadDto[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierReadDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [suppliersLoading, setSuppliersLoading] = useState<boolean>(false);

  // UI: search / supplier filter / pagination
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Modal state for posting
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [modalPo, setModalPo] = useState<PurchaseOrderReadDto | null>(null);
  const [posting, setPosting] = useState(false);

  const navigate = useNavigate();

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await purchaseOrderService.getPendingReceivings();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pending receivings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    setSuppliersLoading(true);
    try {
      const s = await supplierService.getAll();
      setSuppliers(s);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load suppliers.");
    } finally {
      setSuppliersLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filter the orders client-side using search + supplier filter
  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((po) => {
      if (supplierFilter !== "" && po.supplierId !== supplierFilter)
        return false;

      if (!term) return true;

      if ((po.purchaseOrderNumber ?? "").toLowerCase().includes(term))
        return true;
      if ((po.supplierName ?? "").toLowerCase().includes(term)) return true;

      const unprocessed = (po.receivedStocks ?? []).filter((r) => !r.processed);
      for (const r of unprocessed) {
        if ((r.productName ?? `#${r.productId}`).toLowerCase().includes(term))
          return true;
      }

      return false;
    });
  }, [orders, search, supplierFilter]);

  // pagination logic
  const total = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page]);

  // open confirmation modal (shows details)
  const openPostModal = (po: PurchaseOrderReadDto) => {
    setModalPo(po);
    setConfirmModalOpen(true);
  };

  const closePostModal = () => {
    setConfirmModalOpen(false);
    setModalPo(null);
  };

  // confirm posting to inventory
  const handleConfirmPost = async () => {
    if (!modalPo) return;
    setPosting(true);
    try {
      await purchaseOrderService.postReceivedToInventory(modalPo.id);
      toast.success("Posted to inventory");
      closePostModal();
      await fetchPending();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ?? "Failed to post to inventory."
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Stock Receiving</h2>
          <p className="text-sm text-gray-500">
            POs with unprocessed received records (ready to post to inventory)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fetchPending()}
            disabled={loading}
            title="Refresh list"
          >
            Refresh
          </button>

          {/* HISTORY button */}
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/dashboard/inventory/receive/history")}
            title="View posted receives history"
          >
            <FileText className="w-4 h-4 mr-2" /> History
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by PO, supplier, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-sm input-bordered"
            aria-label="Search pending receipts"
          />
        </div>

        <div>
          <label htmlFor="supplierFilter" className="sr-only">
            Filter by supplier
          </label>
          <select
            id="supplierFilter"
            value={supplierFilter}
            onChange={(e) =>
              setSupplierFilter(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="select select-sm select-bordered"
            disabled={suppliersLoading}
          >
            <option value="">All suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-base-300 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading pending receivings...
          </div>
        ) : pageItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pending receivings.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">PO Number</th>
                <th className="px-4 py-2 text-left">Supplier</th>
                <th className="px-4 py-2 text-left">Unprocessed Records</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.map((po) => {
                const unprocessed = (po.receivedStocks ?? []).filter(
                  (r) => !r.processed
                );
                return (
                  <tr key={po.id} className="hover">
                    <td className="px-4 py-2">{po.purchaseOrderNumber}</td>
                    <td className="px-4 py-2">{po.supplierName ?? "—"}</td>

                    <td className="px-4 py-2">
                      {unprocessed.length} record
                      {unprocessed.length !== 1 ? "s" : ""}
                      {unprocessed.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          {unprocessed
                            .slice(0, 3)
                            .map((r: ReceivedStockReadDto) => (
                              <div key={r.id}>
                                {r.productName ?? `#${r.productId}`} —{" "}
                                {r.quantityReceived} on{" "}
                                {r.receivedDate
                                  ? new Date(
                                      r.receivedDate
                                    ).toLocaleDateString()
                                  : "—"}
                              </div>
                            ))}
                          {unprocessed.length > 3 && (
                            <div className="text-xs">...and more</div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="btn btn-xs"
                        onClick={() =>
                          navigate(`/dashboard/purchase-orders/${po.id}`)
                        }
                        title="Open PO details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        className="btn btn-xs btn-primary"
                        onClick={() => openPostModal(po)}
                        disabled={unprocessed.length === 0}
                        title={
                          unprocessed.length === 0
                            ? "No unprocessed received rows"
                            : "Post to Inventory"
                        }
                      >
                        <Download className="w-4 h-4" /> Post to Inventory
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {total === 0
            ? "0 orders"
            : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
        </div>

        <div className="btn-group">
          <button
            className="btn btn-xs"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <button
            className="btn btn-xs"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Confirm Post Modal */}
      {confirmModalOpen && modalPo && (
        <dialog className="modal modal-open" aria-modal>
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg">Post to Inventory</h3>
            <div className="text-sm text-gray-600 mt-2">
              PO: <strong>{modalPo.purchaseOrderNumber}</strong> {" • "}{" "}
              Supplier: <strong>{modalPo.supplierName ?? "—"}</strong>
            </div>

            <div className="mt-4">
              <div className="font-medium">Unprocessed Received Records</div>
              <div className="mt-2 text-sm text-gray-700 max-h-48 overflow-auto">
                {(modalPo.receivedStocks ?? []).filter((r) => !r.processed)
                  .length === 0 ? (
                  <div>No unprocessed received records.</div>
                ) : (
                  (modalPo.receivedStocks ?? [])
                    .filter((r) => !r.processed)
                    .map((r) => (
                      <div key={r.id} className="py-2 border-b last:border-b-0">
                        <div className="text-sm">
                          <strong>{r.productName ?? `#${r.productId}`}</strong>
                        </div>
                        <div className="text-xs text-gray-600">
                          Qty: {r.quantityReceived} • {r.referenceNumber ?? "—"}{" "}
                          •{" "}
                          {r.receivedDate
                            ? new Date(r.receivedDate).toLocaleDateString()
                            : "—"}
                        </div>
                        {r.notes && (
                          <div className="text-xs mt-1">{r.notes}</div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="modal-action mt-4">
              <button
                className="btn"
                onClick={closePostModal}
                disabled={posting}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmPost}
                disabled={
                  posting ||
                  (modalPo.receivedStocks ?? []).filter((r) => !r.processed)
                    .length === 0
                }
              >
                {posting ? "Posting..." : "Confirm: Post to Inventory"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
