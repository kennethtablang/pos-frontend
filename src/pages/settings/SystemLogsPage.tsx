/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/settings/SystemLogsPage.tsx
import { useEffect, useState, useMemo } from "react";
import { BookOpen, Clock, Users, ArrowUpDown } from "lucide-react";
import toast from "react-hot-toast";
import { authLogService } from "@/services/authLogService";
import type {
  LoginAttemptLogDto,
  SystemLogDto,
  UserSessionDto,
} from "@/types/auth";

type View = "login" | "system" | "sessions";
type SortDir = "asc" | "desc";

interface SortConfig {
  key: string;
  direction: SortDir;
}

export default function SystemLogsPage() {
  const [view, setView] = useState<View>("login");
  const [loginAttempts, setLoginAttempts] = useState<LoginAttemptLogDto[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLogDto[]>([]);
  const [sessions, setSessions] = useState<UserSessionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Fetch data based on view
  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === "login") {
        setLoginAttempts(await authLogService.getLoginAttempts());
      } else if (view === "system") {
        setSystemLogs(await authLogService.getSystemLogs());
      } else {
        setSessions(await authLogService.getActiveUserSessions());
      }
    } catch {
      toast.error("Failed to fetch logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSearchTerm("");
    setSortConfig(null);
    toast.success(
      view === "login"
        ? "Viewing Login Attempts"
        : view === "system"
          ? "Viewing System Logs"
          : "Viewing Active Sessions"
    );
  }, [view]);

  // Utility: sort & filter data
  const getProcessedData = useMemo(() => {
    let data: any[] =
      view === "login"
        ? loginAttempts
        : view === "system"
          ? systemLogs
          : sessions;

    // 1) Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter((item) =>
        Object.values(item)
          .filter((v) => typeof v === "string" || typeof v === "number")
          .some((v) => String(v).toLowerCase().includes(term))
      );
    }

    // 2) Sort
    if (sortConfig) {
      const { key, direction } = sortConfig;
      data = [...data].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") {
          return direction === "asc" ? av - bv : bv - av;
        }
        const astr = String(av).toLowerCase();
        const bstr = String(bv).toLowerCase();
        return direction === "asc"
          ? astr.localeCompare(bstr)
          : bstr.localeCompare(astr);
      });
    }

    return data;
  }, [loginAttempts, systemLogs, sessions, view, searchTerm, sortConfig]);

  // Called when header clicked
  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        // toggle direction
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Render table headers with sort icons
  const SortableHeader: React.FC<{ label: string; field: string }> = ({
    label,
    field,
  }) => {
    const active = sortConfig?.key === field;
    return (
      <th
        className="text-left px-4 py-2 cursor-pointer select-none"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1">
          {label}
          <ArrowUpDown
            className={`w-4 h-4 ${active ? "text-primary" : "text-gray-400"}`}
          />
        </div>
      </th>
    );
  };

  return (
    <section className="p-6 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {view === "login" && <Clock className="w-6 h-6 text-primary" />}
          {view === "system" && <BookOpen className="w-6 h-6 text-primary" />}
          {view === "sessions" && <Users className="w-6 h-6 text-primary" />}
          <h1 className="text-2xl font-bold text-primary">
            {view === "login"
              ? "Login Attempts"
              : view === "system"
                ? "System Logs"
                : "Active Sessions"}
          </h1>
        </div>
        <div className="btn-group">
          <button
            className={`btn btn-sm ${view === "login" ? "btn-primary" : ""}`}
            onClick={() => setView("login")}
          >
            Login Attempts
          </button>
          <button
            className={`btn btn-sm ${view === "system" ? "btn-primary" : ""}`}
            onClick={() => setView("system")}
          >
            System Logs
          </button>
          <button
            className={`btn btn-sm ${view === "sessions" ? "btn-primary" : ""}`}
            onClick={() => setView("sessions")}
          >
            Active Sessions
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="w-full max-w-xs">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-sm input-bordered w-full"
        />
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : getProcessedData.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No records found.</div>
        ) : view === "login" ? (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <SortableHeader
                  label="Email/Username"
                  field="usernameOrEmail"
                />
                <SortableHeader label="Time" field="attemptedAt" />
                <SortableHeader label="Success" field="wasSuccessful" />
                <SortableHeader label="Reason" field="failureReason" />
                <SortableHeader label="IP" field="ipAddress" />
                <SortableHeader label="Terminal" field="terminalName" />
              </tr>
            </thead>
            <tbody>
              {getProcessedData.map((a: LoginAttemptLogDto) => (
                <tr key={a.id} className="hover">
                  <td className="px-4 py-2">{a.usernameOrEmail}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(a.attemptedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`badge badge-sm ${
                        a.wasSuccessful ? "badge-success" : "badge-error"
                      }`}
                    >
                      {a.wasSuccessful ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{a.failureReason || "-"}</td>
                  <td className="px-4 py-2">{a.ipAddress || "-"}</td>
                  <td className="px-4 py-2">{a.terminalName || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : view === "system" ? (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <SortableHeader label="Time" field="timestamp" />
                <SortableHeader label="Module" field="module" />
                <SortableHeader label="Action" field="actionType" />
                <SortableHeader label="User" field="performedBy" />
                <SortableHeader label="Description" field="description" />
              </tr>
            </thead>
            <tbody>
              {getProcessedData.map((l: SystemLogDto) => (
                <tr key={l.id} className="hover">
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{l.module}</td>
                  <td className="px-4 py-2">{l.actionType}</td>
                  <td className="px-4 py-2">{l.performedBy || "-"}</td>
                  <td className="px-4 py-2">{l.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <SortableHeader label="User" field="userFullName" />
                <SortableHeader label="Login Time" field="loginTime" />
                <SortableHeader label="Terminal" field="terminalName" />
                <SortableHeader label="IP" field="ipAddress" />
              </tr>
            </thead>
            <tbody>
              {getProcessedData.map((s: UserSessionDto) => (
                <tr key={s.id} className="hover">
                  <td className="px-4 py-2">{s.userFullName}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(s.loginTime).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{s.terminalName || "-"}</td>
                  <td className="px-4 py-2">{s.ipAddress || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
