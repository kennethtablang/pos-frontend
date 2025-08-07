// src/components/settings/counter/EditCounterModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { counterSettingService } from "@/services/counterSettingService";
import type { CounterUpdateDto, CounterReadDto } from "@/types/counterSetting";
import toast from "react-hot-toast";

export type EditCounterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  counter: CounterReadDto | null;
  onCounterUpdated: () => Promise<void>;
};

export const EditCounterModal = ({
  isOpen,
  onClose,
  counter,
  onCounterUpdated,
}: EditCounterModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CounterUpdateDto>();

  // Populate form when `counter` changes
  useEffect(() => {
    if (counter) {
      reset({
        name: counter.name,
        description: counter.description ?? "",
        terminalIdentifier: counter.terminalIdentifier ?? "",
        isActive: counter.isActive,
      });
    }
  }, [counter, reset]);

  const mutation = useMutation({
    mutationFn: (data: CounterUpdateDto) =>
      counterSettingService.update(counter!.id, data),
    onSuccess: async () => {
      toast.success("Counter updated successfully");
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ["counters"] });
      // Let parent re-fetch
      await onCounterUpdated();
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to update counter");
    },
  });

  const onSubmit = (data: CounterUpdateDto) => {
    mutation.mutate(data);
  };

  if (!isOpen || !counter) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Edit Counter</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="input input-bordered w-full"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              {...register("description")}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Terminal Identifier */}
          <div>
            <label className="label">Terminal Identifier (Optional)</label>
            <input
              type="text"
              {...register("terminalIdentifier")}
              className="input input-bordered w-full"
            />
          </div>

          {/* Is Active */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Is Active?</span>
              <input
                type="checkbox"
                {...register("isActive")}
                className="checkbox ml-2"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={mutation.status === "pending"}
            >
              {mutation.status === "pending" ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
