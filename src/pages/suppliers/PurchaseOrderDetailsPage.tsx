/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/purchaseorders/PurchaseOrderDetailsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Download, Trash, FileText, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";

import { purchaseOrderService } from "@/services/purchaseOrderService";
import type {
  PurchaseOrderReadDto,
  PurchaseItemReadDto,
  ReceivedStockReadDto,
} from "@/types/purchaseOrder";

import EditPurchaseOrderModal from "@/components/purchaseorders/EditPurchaseOrderModal";
import ReceiveStockModal from "@/components/purchaseorders/ReceiveStockModal";

import {
  PurchaseOrderStatus,
  PurchaseOrderStatusLabels,
} from "@/types/purchaseOrder";

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<PurchaseOrderReadDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // UI state for modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PurchaseItemReadDto | null>(
    null
  );

  // Fetch the PO by id
  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const po = await purchaseOrderService.getById(Number(id));
      setOrder(po);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load purchase order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Derived totals (defensive)
  const total = useMemo(() => order?.totalCost ?? 0, [order]);

  // Actions
  const openEdit = () => {
    if (!order) return;
    setIsEditOpen(true);
  };

  const openReceiveForItem = (item: PurchaseItemReadDto) => {
    if (!order) return;
    setSelectedItem(item);
    setIsReceiveOpen(true);
  };

  const removeItem = async (item: PurchaseItemReadDto) => {
    if ((item.receivedQuantity ?? 0) > 0) {
      toast.error("Cannot remove an item that already has received quantity.");
      return;
    }
    if (!confirm("Remove this item from the purchase order?")) return;

    try {
      setRefreshing(true);
      await purchaseOrderService.removeItem(item.id);
      toast.success("Item removed");
      await fetchOrder();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to remove item.");
    } finally {
      setRefreshing(false);
    }
  };

  const deleteReceivedRecord = async (rec: ReceivedStockReadDto) => {
    if (
      !confirm(
        "Delete this received record? This will adjust received quantities."
      )
    )
      return;
    try {
      setRefreshing(true);
      await purchaseOrderService.deleteReceivedStock(rec.id);
      toast.success("Received record deleted");
      await fetchOrder();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ?? "Failed to delete received record."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const exportItemsCsv = () => {
    if (!order) {
      toast("Nothing to export", { icon: "ℹ️" });
      return;
    }
    const rows = [
      ["Product", "Quantity", "Received", "CostPerUnit", "LineTotal", "Notes"],
      ...order.purchaseItems.map((it) => [
        it.productName ?? `#${it.productId}`,
        it.quantity,
        it.receivedQuantity ?? 0,
        it.costPerUnit.toFixed(2),
        ((it.quantity ?? 0) * (it.costPerUnit ?? 0)).toFixed(2),
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

  const exportReceivedCsv = () => {
    if (!order || !order.receivedStocks || order.receivedStocks.length === 0) {
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

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading purchase order...
      </div>
    );
  }

  if (!order) {
    return (
      <section className="p-6">
        <div className="text-center text-gray-500">
          Purchase order not found.
        </div>
        <div className="mt-4">
          <button className="btn" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{order.purchaseOrderNumber}</h1>
          <div className="text-sm text-gray-500">
            Supplier: {order.supplierName ?? "—"} • Status:{" "}
            <span className="font-medium">
              {PurchaseOrderStatusLabels[order.status]}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Order Date: {new Date(order.orderDate).toLocaleString()} • Created:{" "}
            {order.createdByUserName ?? "—"} • Total:{" "}
            <strong>{total.toFixed(2)}</strong>
          </div>
          {order.remarks && <div className="mt-2 text-sm">{order.remarks}</div>}
        </div>

        <div className="flex gap-2">
          <button
            className="btn btn-ghost"
            title="Back"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button
            className="btn btn-outline"
            onClick={openEdit}
            title="Edit PO"
          >
            <Edit className="w-4 h-4" /> Edit
          </button>

          <button
            className="btn btn-ghost"
            onClick={exportItemsCsv}
            title="Export items CSV"
          >
            <FileText className="w-4 h-4" /> Export Items
          </button>

          <button
            className="btn btn-ghost"
            onClick={exportReceivedCsv}
            title="Export received CSV"
            disabled={!order.receivedStocks?.length}
          >
            <FileText className="w-4 h-4" /> Export Received
          </button>
        </div>
      </div>

      {/* Items section */}
      <div className="rounded-lg border border-base-300 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Items</div>
          <div className="text-sm text-gray-500">
            Total lines: {order.purchaseItems.length}
          </div>
        </div>

        {order.purchaseItems.length === 0 ? (
          <div className="text-sm text-gray-500 p-4">
            No items on this purchase order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Received</th>
                  <th>Cost/unit</th>
                  <th>Line Total</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {order.purchaseItems.map((it) => {
                  const remaining = it.quantity - (it.receivedQuantity ?? 0);
                  const isFullyReceived = remaining <= 0;
                  const receiveDisabled =
                    isFullyReceived ||
                    order.status === PurchaseOrderStatus.Received ||
                    order.status === PurchaseOrderStatus.Cancelled;

                  return (
                    <tr key={it.id}>
                      <td>{it.productName ?? `#${it.productId}`}</td>
                      <td>{it.quantity}</td>
                      <td>{it.receivedQuantity ?? 0}</td>
                      <td>{it.costPerUnit.toFixed(2)}</td>
                      <td>
                        {((it.quantity ?? 0) * it.costPerUnit).toFixed(2)}
                      </td>
                      <td>{it.notes ?? "—"}</td>
                      <td className="flex gap-2">
                        <button
                          className="btn btn-xs btn-ghost"
                          title="Receive"
                          onClick={() => openReceiveForItem(it)}
                          disabled={receiveDisabled}
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          className="btn btn-xs btn-outline btn-error"
                          title={
                            (it.receivedQuantity ?? 0) > 0
                              ? "Cannot remove: item already received"
                              : "Remove item"
                          }
                          onClick={() => removeItem(it)}
                          disabled={
                            (it.receivedQuantity ?? 0) > 0 || refreshing
                          }
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Received Stocks */}
      <div className="rounded-lg border border-base-300 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Received Stocks</div>
          <div className="text-sm text-gray-500">
            Total records: {order.receivedStocks?.length ?? 0}
          </div>
        </div>

        {!order.receivedStocks || order.receivedStocks.length === 0 ? (
          <div className="text-sm text-gray-500 p-4">
            No received stock records.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Product</th>
                  <th>Qty Received</th>
                  <th>Received Date</th>
                  <th>Reference</th>
                  <th>Notes</th>
                  <th>Received By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {order.receivedStocks.map((r) => (
                  <tr key={r.id}>
                    <td>{r.productName ?? `#${r.productId}`}</td>
                    <td>{r.quantityReceived}</td>
                    <td>
                      {r.receivedDate
                        ? new Intl.DateTimeFormat(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }).format(new Date(r.receivedDate))
                        : "—"}
                    </td>

                    <td>{r.referenceNumber ?? "—"}</td>
                    <td>{r.notes ?? "—"}</td>
                    <td>{r.receivedByUserName ?? "—"}</td>
                    <td>
                      <button
                        className="btn btn-xs btn-outline btn-error"
                        title="Delete received record"
                        onClick={() => deleteReceivedRecord(r)}
                        disabled={refreshing}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit & Receive modals */}
      <EditPurchaseOrderModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          fetchOrder();
        }}
        order={order}
        // expecting modal will call onUpdated prop; if not present we fallback to closing + fetching
        onUpdated={async () => {
          setIsEditOpen(false);
          await fetchOrder();
        }}
        suppliers={[]} /* If your Edit modal requires suppliers, you can fetch them here or pass props */
      />

      {isReceiveOpen && selectedItem && (
        <ReceiveStockModal
          isOpen={isReceiveOpen}
          onClose={async () => {
            setIsReceiveOpen(false);
            setSelectedItem(null);
            await fetchOrder();
          }}
          purchaseOrder={order}
          item={selectedItem}
          onReceived={async () => {
            setIsReceiveOpen(false);
            setSelectedItem(null);
            await fetchOrder();
          }}
        />
      )}
    </section>
  );
}
