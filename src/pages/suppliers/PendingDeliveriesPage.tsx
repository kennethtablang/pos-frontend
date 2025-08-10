/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/purchaseorders/PendingDeliveriesPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Search, Eye, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { purchaseOrderService } from "@/services/purchaseOrderService";
import { supplierService } from "@/services/supplierServices";

import type { PurchaseOrderReadDto } from "@/types/purchaseOrder";
import type { SupplierReadDto } from "@/types/supplier";
import {
  PurchaseOrderStatus,
  PurchaseOrderStatusLabels,
} from "@/types/purchaseOrder";

export default function PendingDeliveriesPage() {
  const [orders, setOrders] = useState<PurchaseOrderReadDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & UI
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<number | "">("");
  const [suppliers, setSuppliers] = useState<SupplierReadDto[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const navigate = useNavigate();

  // fetch orders (we will filter client-side for pending statuses)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await purchaseOrderService.getAll();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load purchase orders.");
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
    fetchOrders();
    fetchSuppliers();
    toast.success("Navigated to Pending Deliveries");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // derive pending orders: Ordered or PartiallyReceived
  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === PurchaseOrderStatus.Ordered ||
          o.status === PurchaseOrderStatus.PartiallyReceived
      ),
    [orders]
  );

  // filtered by user inputs
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return pendingOrders.filter((o) => {
      if (supplierFilter !== "" && o.supplierId !== supplierFilter)
        return false;
      if (!term) return true;
      return (
        o.purchaseOrderNumber.toLowerCase().includes(term) ||
        (o.supplierName ?? "").toLowerCase().includes(term)
      );
    });
  }, [pendingOrders, search, supplierFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Navigation to details page
  const handleView = (id: number) => {
    navigate(`/dashboard/purchase-orders/${id}`);
  };

  // Export helpers (items / received) - reuse same CSV logic as in details page
  const exportItemsCsv = (order: PurchaseOrderReadDto) => {
    const rows = [
      ["Product", "Quantity", "Received", "CostPerUnit", "LineTotal", "Notes"],
      ...order.purchaseItems.map((it) => [
        it.productName ?? `#${it.productId}`,
        it.quantity,
        it.receivedQuantity ?? 0,
        it.costPerUnit.toFixed(2),
        ((it.quantity ?? 0) * it.costPerUnit).toFixed(2),
        it.notes ?? "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${order.purchaseOrderNumber}-items.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Export started");
  };

  const exportReceivedCsv = (order: PurchaseOrderReadDto) => {
    if (!order.receivedStocks || order.receivedStocks.length === 0) {
      toast("No received records to export", { icon: "ℹ️" });
      return;
    }
    const rows = [
      [
        "Product",
        "QuantityReceived",
        "ReceivedDate",
        "ReferenceNumber",
        "Notes",
        "ReceivedBy",
      ],
      ...order.receivedStocks.map((r) => [
        r.productName ?? `#${r.productId}`,
        r.quantityReceived,
        r.receivedDate,
        r.referenceNumber ?? "",
        r.notes ?? "",
        r.receivedByUserName ?? "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${order.purchaseOrderNumber}-received.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Export started");
  };

  // helper to check overdue
  const isOverdue = (expected?: string | null) => {
    if (!expected) return false;
    try {
      const d = new Date(expected);
      const today = new Date();
      // ignore time portion for overdue check
      return d.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
    } catch {
      return false;
    }
  };

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-primary">
            Pending Deliveries
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOrders()}
            className="btn btn-ghost btn-sm"
            disabled={loading}
            title="Refresh list"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by PO number or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-sm input-bordered"
            aria-label="Search pending deliveries"
          />
        </div>

        <div>
          <label htmlFor="supplierSelect" className="sr-only">
            Filter by supplier
          </label>
          <select
            id="supplierSelect"
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

      {/* List */}
      <div className="rounded-lg border border-base-300 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading pending deliveries...
          </div>
        ) : pageItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pending deliveries.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">PO Number</th>
                <th className="px-4 py-2 text-left">Supplier</th>
                <th className="px-4 py-2 text-left">Expected</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((o) => (
                <tr key={o.id} className="hover">
                  <td className="px-4 py-2">{o.purchaseOrderNumber}</td>
                  <td className="px-4 py-2">{o.supplierName ?? "—"}</td>
                  <td className="px-4 py-2">
                    {o.expectedDeliveryDate
                      ? new Date(o.expectedDeliveryDate).toLocaleDateString()
                      : "—"}
                    {isOverdue(o.expectedDeliveryDate) && (
                      <span className="ml-2 badge badge-sm badge-error">
                        Overdue
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`badge badge-sm ${
                        o.status === PurchaseOrderStatus.PartiallyReceived
                          ? "badge-warning"
                          : "badge-ghost"
                      }`}
                    >
                      {PurchaseOrderStatusLabels[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {o.totalCost.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="btn btn-xs btn-ghost"
                      title="View details"
                      onClick={() => handleView(o.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      className="btn btn-xs btn-ghost"
                      title="Export items CSV"
                      onClick={() => exportItemsCsv(o)}
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    <button
                      className="btn btn-xs btn-ghost"
                      title="Export received CSV"
                      onClick={() => exportReceivedCsv(o)}
                      disabled={
                        !o.receivedStocks || o.receivedStocks.length === 0
                      }
                    >
                      <FileText className="w-4 h-4" />
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
    </section>
  );
}
