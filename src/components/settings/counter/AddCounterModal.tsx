// src/components/settings/counter/AddCounterModal.tsx
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { counterSettingService } from "@/services/counterSettingService";
import type { CounterCreateDto } from "@/types/counterSetting";
import toast from "react-hot-toast";

export type AddCounterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCounterAdded: () => Promise<void>;
};

export const AddCounterModal = ({
  isOpen,
  onClose,
  onCounterAdded,
}: AddCounterModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CounterCreateDto>();

  const mutation = useMutation({
    mutationFn: (data: CounterCreateDto) => counterSettingService.create(data),
    onSuccess: async () => {
      toast.success("Counter created successfully");

      // Invalidate React Query cache for counters
      queryClient.invalidateQueries({ queryKey: ["counters"] });

      // Call parent to refetch local state
      await onCounterAdded();

      // Reset form and close
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to create counter");
    },
  });

  const onSubmit = (data: CounterCreateDto) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Add Counter</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
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

          {/* Description Field */}
          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              {...register("description")}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Terminal Identifier Field */}
          <div>
            <label className="label">Terminal Identifier (Optional)</label>
            <input
              type="text"
              {...register("terminalIdentifier")}
              className="input input-bordered w-full"
            />
          </div>

          {/* Action Buttons */}
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
