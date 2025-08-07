import { useEffect, useState } from "react";
import { UserPlus, Pencil, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { userService } from "@/services/userService";
import type { UserReadDto } from "@/types/user";
import AddUserModal from "@/components/usermanagement/AddUserModal";
import EditUserModal from "@/components/usermanagement/EditUserModal";

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserReadDto[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserReadDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserReadDto | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserReadDto) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    const filtered = users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchUsers();
    toast.success("Navigated to User Management");
  }, []);

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">User Management</h1>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn btn-primary btn-sm gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-xs">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={handleSearch}
          className="input input-sm input-bordered w-full"
        />
      </div>

      {/* Add & Edit Modals */}
      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onUserAdded={fetchUsers}
      />
      {selectedUser && (
        <EditUserModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUserUpdated={fetchUsers}
        />
      )}

      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No users found.</div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-2">Full Name</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Created</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover">
                  <td className="px-4 py-2">{user.fullName}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{roleLabel(user.role)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`badge badge-sm ${
                        user.isActive ? "badge-success" : "badge-error"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(user.dateCreated).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn btn-xs btn-outline btn-secondary gap-1"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function roleLabel(role: number): string {
  switch (role) {
    case 0:
      return "Admin";
    case 1:
      return "Manager";
    case 2:
      return "Cashier";
    case 3:
      return "Warehouse";
    default:
      return "Unknown";
  }
}
