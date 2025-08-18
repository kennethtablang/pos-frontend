/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/pages/inventory/StockReceivingHistoryPage.tsx */
import React, { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, Eye, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { stockReceiveService } from "@/services/stockReceiveService";
import type {
  StockReceiveReadDto,
  StockReceiveItemReadDto,
} from "@/types/stockReceive";

export default function StockReceivingHistoryPage() {
  const [receives, setReceives] = useState<StockReceiveReadDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [selected, setSelected] = useState<StockReceiveReadDto | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const navigate = useNavigate();

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await stockReceiveService.getAll();
      setReceives(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load stock receive history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return receives;
    return receives.filter((r) => {
      if ((r.purchaseOrderNumber ?? "").toLowerCase().includes(term))
        return true;
      if ((r.receivedByUserName ?? "").toLowerCase().includes(term))
        return true;
      if ((r.referenceNumber ?? "").toLowerCase().includes(term)) return true;
      // search inside items
      if (
        r.items.some((i) => (i.productName ?? "").toLowerCase().includes(term))
      )
        return true;
      return false;
    });
  }, [receives, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openView = (rec: StockReceiveReadDto) => {
    setSelected(rec);
    setViewOpen(true);
  };

  const closeView = () => {
    setSelected(null);
    setViewOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Delete this Stock Receive record? This will NOT revert product on-hand or inventory transactions."
      )
    )
      return;
    try {
      await stockReceiveService.delete(id);
      toast.success("Deleted");
      await fetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to delete");
    }
  };

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">
            Stock Receive History
          </h2>
          <p className="text-sm text-gray-500">
            Previously posted stock receives
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn" onClick={() => navigate(-1)} title="Back">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by PO, product, reference, or received by..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-sm input-bordered w-full max-w-md"
          />
        </div>
      </div>

      <div className="rounded-lg border border-base-300 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading receives...
          </div>
        ) : pageItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No receives found.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th>PO</th>
                <th>Received Date</th>
                <th>Received By</th>
                <th>Reference</th>
                <th>Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((r) => (
                <tr key={r.id} className="hover">
                  <td className="px-4 py-2">
                    {r.purchaseOrderNumber ?? `#${r.purchaseOrderId}`}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(r.receivedDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{r.receivedByUserName ?? "—"}</td>
                  <td className="px-4 py-2">{r.referenceNumber ?? "—"}</td>
                  <td className="px-4 py-2">{r.items.length}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="btn btn-xs"
                      onClick={() => openView(r)}
                      title="View items"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-xs btn-outline btn-error"
                      onClick={() => handleDelete(r.id)}
                      title="Delete"
                    >
                      <Trash className="w-4 h-4" />
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
            ? "0 receives"
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

      {/* View modal */}
      {viewOpen && selected && (
        <dialog className="modal modal-open" aria-modal>
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg">Stock Receive #{selected.id}</h3>
            <div className="text-sm text-gray-600">
              PO:{" "}
              <strong>
                {selected.purchaseOrderNumber ?? `#${selected.purchaseOrderId}`}
              </strong>{" "}
              • Received:{" "}
              <strong>
                {new Date(selected.receivedDate).toLocaleString()}
              </strong>{" "}
              • By:{" "}
              <strong>
                {selected.receivedByUserName ?? selected.receivedByUserId}
              </strong>
            </div>

            <div className="mt-4 overflow-auto max-h-96">
              {selected.items.length === 0 ? (
                <div className="text-sm text-gray-500">No items.</div>
              ) : (
                <table className="table table-zebra table-sm w-full">
                  <thead className="bg-base-200">
                    <tr>
                      <th>Product</th>
                      <th className="text-right">Qty</th>
                      <th>Unit Cost</th>
                      <th>Batch</th>
                      <th>Expiry</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.items.map((it: StockReceiveItemReadDto) => (
                      <tr key={it.id}>
                        <td>{it.productName ?? `#${it.productId}`}</td>
                        <td className="text-right">{it.quantity}</td>
                        <td>{it.unitCost?.toFixed(2) ?? "—"}</td>
                        <td>{it.batchNumber ?? "—"}</td>
                        <td>
                          {it.expiryDate
                            ? new Date(it.expiryDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>{it.remarks ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-action">
              <button className="btn" onClick={closeView}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
