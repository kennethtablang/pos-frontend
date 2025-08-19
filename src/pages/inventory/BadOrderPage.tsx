/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/pages/inventory/BadOrdersPage.tsx */
import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash, Image } from "lucide-react";
import toast from "react-hot-toast";

import { badOrderService } from "@/services/badOrderService";
import type { BadOrderReadDto } from "@/types/badOrder";

import AddBadOrderModal from "@/components/inventory/badorders/AddBadOrderModal";
import EditBadOrderModal from "@/components/inventory/badorders/EditBadOrderModal";
import ConfirmDeleteModal from "@/components/common/DeleteConfirmationModal";

export default function BadOrdersPage() {
  const [badOrders, setBadOrders] = useState<BadOrderReadDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<BadOrderReadDto[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<BadOrderReadDto | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const l = await badOrderService.getAll();
      setBadOrders(l);
      setFiltered(l);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bad orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // show navigated toast only once
    toast.success("Navigated to Bad Orders");
  }, []);

  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      setFiltered(badOrders);
      return;
    }
    setFiltered(
      badOrders.filter(
        (b) =>
          b.productName.toLowerCase().includes(term) ||
          b.reason.toLowerCase().includes(term) ||
          (b.reportedByUserName ?? "").toLowerCase().includes(term) ||
          (b.remarks ?? "").toLowerCase().includes(term)
      )
    );
  }, [search, badOrders]);

  const openEdit = (b: BadOrderReadDto) => {
    setSelected(b);
    setIsEditOpen(true);
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await badOrderService.delete(id);
      toast.success("Bad order deleted");
      await fetchList();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to delete bad order");
    }
  };

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Bad Orders</h1>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search product / reason / reported by..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-sm input-bordered"
          />
          <button
            className="btn btn-primary btn-sm gap-2"
            onClick={() => setIsAddOpen(true)}
            aria-label="Add bad order"
            disabled={loading}
          >
            <Plus className="w-4 h-4" /> Add Bad Order
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No bad orders found.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Reason</th>
                <th>Remarks</th>
                <th>Date</th>
                <th>Reported By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>{b.productName}</td>
                  <td>{b.quantity}</td>
                  <td>{b.reason}</td>
                  <td>{b.remarks ?? "—"}</td>
                  <td>{new Date(b.badOrderDate).toLocaleString()}</td>
                  <td>{b.reportedByUserName ?? "—"}</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => openEdit(b)}
                      aria-label={`Edit bad order ${b.id}`}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => confirmDelete(b.id)}
                      aria-label={`Delete bad order ${b.id}`}
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

      {/* Modals */}
      <AddBadOrderModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={async () => {
          setIsAddOpen(false);
          await fetchList();
        }}
      />

      {selected && (
        <EditBadOrderModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelected(null);
          }}
          badOrder={selected}
          onUpdated={async () => {
            setIsEditOpen(false);
            setSelected(null);
            await fetchList();
          }}
        />
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        title="Delete Bad Order"
        message="Are you sure you want to delete this bad order? This will NOT restore units back to stock."
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
