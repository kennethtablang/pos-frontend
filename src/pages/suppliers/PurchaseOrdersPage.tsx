/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/purchaseorders/PurchaseOrdersPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Edit, Trash, Eye, Download } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { purchaseOrderService } from "@/services/purchaseOrderService";
import { supplierService } from "@/services/supplierServices";

import type { PurchaseOrderReadDto } from "@/types/purchaseOrder";
import type { SupplierReadDto } from "@/types/supplier";

import CreatePurchaseOrderModal from "@/components/purchaseorders/CreatePurchaseOrderModal";
import EditPurchaseOrderModal from "@/components/purchaseorders/EditPurchaseOrderModal";
import ReceiveStockModal from "@/components/purchaseorders/ReceiveStockModal";

import {
  PurchaseOrderStatus,
  PurchaseOrderStatusLabels,
} from "@/types/purchaseOrder";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrderReadDto[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrderReadDto[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<number | "">("");

  const [suppliers, setSuppliers] = useState<SupplierReadDto[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // modals / selection
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<PurchaseOrderReadDto | null>(null);

  const navigate = useNavigate();

  // fetch all POs
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await purchaseOrderService.getAll();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch purchase orders.");
    } finally {
      setLoading(false);
    }
  };

  // fetch suppliers for filter dropdown
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
    toast.success("Navigated to Purchase Orders");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // search + supplier filter
  useEffect(() => {
    const term = search.trim().toLowerCase();
    setFilteredOrders(
      orders.filter((o) => {
        if (supplierFilter !== "" && o.supplierId !== supplierFilter)
          return false;

        if (!term) return true;
        return (
          o.purchaseOrderNumber.toLowerCase().includes(term) ||
          (o.supplierName ?? "").toLowerCase().includes(term)
        );
      })
    );
    setPage(1);
  }, [orders, search, supplierFilter]);

  const total = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page]);

  // helper for badge classes (adjust to your theme)
  const badgeClassForStatus = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.Draft:
        return "badge badge-sm"; // default/neutral
      case PurchaseOrderStatus.Ordered:
        return "badge badge-sm badge-info";
      case PurchaseOrderStatus.PartiallyReceived:
        return "badge badge-sm badge-warning";
      case PurchaseOrderStatus.Cancelled:
        return "badge badge-sm badge-error";
      case PurchaseOrderStatus.Received:
        return "badge badge-sm badge-success";
      default:
        return "badge badge-sm";
    }
  };

  // actions
  const openEdit = (o: PurchaseOrderReadDto) => {
    setSelectedOrder(o);
    setIsEditOpen(true);
  };

  const openReceive = async (id: number) => {
    try {
      const po = await purchaseOrderService.getById(id);
      setSelectedOrder(po);
      setIsReceiveOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load purchase order details.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete purchase order? This cannot be undone.")) return;
    try {
      await purchaseOrderService.delete(id);
      toast.success("Purchase order deleted");
      await fetchOrders();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ?? "Failed to delete purchase order"
      );
    }
  };

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">
            Purchase Orders
          </span>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary btn-sm gap-2"
          disabled={loading}
        >
          <Plus className="w-4 h-4" /> Create PO
        </button>
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
            aria-label="Search purchase orders"
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
            aria-label="Filter by supplier"
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
            Loading purchase orders...
          </div>
        ) : pageItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No purchase orders found.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">PO Number</th>
                <th className="px-4 py-2 text-left">Supplier</th>
                <th className="px-4 py-2 text-left">Order Date</th>

                {/* New Status column */}
                <th className="px-4 py-2 text-left">Status</th>

                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-left">Expected</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.map((o) => {
                const status = (o.status ??
                  PurchaseOrderStatus.Draft) as PurchaseOrderStatus;
                const receiveDisabled =
                  status === PurchaseOrderStatus.Received ||
                  status === PurchaseOrderStatus.Cancelled;

                return (
                  <tr key={o.id} className="hover">
                    <td className="px-4 py-2">
                      <button
                        className="link"
                        onClick={() =>
                          navigate(`/dashboard/purchase-orders/${o.id}`)
                        }
                        title={`Open ${o.purchaseOrderNumber}`}
                      >
                        {o.purchaseOrderNumber}
                      </button>
                    </td>

                    <td className="px-4 py-2">{o.supplierName ?? "—"}</td>

                    <td className="px-4 py-2">
                      {new Date(o.orderDate).toLocaleDateString()}
                    </td>

                    {/* Status cell */}
                    <td className="px-4 py-2">
                      <span className={badgeClassForStatus(status)}>
                        {PurchaseOrderStatusLabels[status]}
                      </span>
                    </td>

                    <td className="px-4 py-2 text-right">
                      {o.totalCost?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-4 py-2">
                      {o.expectedDeliveryDate
                        ? new Date(o.expectedDeliveryDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="btn btn-xs btn-ghost"
                        title="View details"
                        onClick={() =>
                          navigate(`/dashboard/purchase-orders/${o.id}`)
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        className="btn btn-xs btn-outline"
                        title="Edit"
                        onClick={() => openEdit(o)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        className="btn btn-xs btn-ghost"
                        title="Receive (open receive modal)"
                        onClick={() => openReceive(o.id)}
                        disabled={receiveDisabled}
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        className="btn btn-xs btn-outline btn-error"
                        title="Delete PO"
                        onClick={() => handleDelete(o.id)}
                      >
                        <Trash className="w-4 h-4" />
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

      {/* Modals */}
      <CreatePurchaseOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={async () => {
          setIsCreateOpen(false);
          await fetchOrders();
        }}
        suppliers={suppliers}
      />

      {selectedOrder && (
        <EditPurchaseOrderModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onUpdated={async () => {
            setIsEditOpen(false);
            setSelectedOrder(null);
            await fetchOrders();
          }}
          suppliers={suppliers}
        />
      )}

      {selectedOrder && (
        <ReceiveStockModal
          isOpen={isReceiveOpen}
          onClose={() => {
            setIsReceiveOpen(false);
            setSelectedOrder(null);
          }}
          purchaseOrder={selectedOrder}
          onReceived={async () => {
            setIsReceiveOpen(false);
            setSelectedOrder(null);
            await fetchOrders();
          }}
        />
      )}
    </section>
  );
}
