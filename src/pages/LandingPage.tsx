import {
  LucideStore,
  LucideUsers,
  LucideClipboardList,
  LucideArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="bg-base-100 min-h-screen">
      {/* Hero Section */}
      <div className="hero min-h-screen bg-gradient-to-r from-slate-900 to-indigo-900 text-white px-10">
        <div className="hero-content max-w-7xl mx-auto flex-col-reverse lg:flex-row-reverse gap-10">
          <img
            src="../../src/assets/pos-illustration.svg"
            className="w-full max-w-md"
            alt="POS Illustration"
          />
          <div className="text-left">
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Smart POS Solution for SMEs
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-gray-200">
              Fast. Efficient. BIR Compliant. <br />
              Empower your retail or grocery business with smart inventory and
              sales management.
            </p>
            <div className="flex gap-4">
              <button
                className="btn bg-indigo-600 hover:bg-indigo-500 text-white btn-lg border-none"
                onClick={() => navigate("/login")}
              >
                Get Started
              </button>
              <button className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-indigo-900">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-10 bg-base-200 text-center">
        <h2 className="text-4xl font-bold mb-14">Core Features</h2>
        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          <div className="card bg-base-100 shadow-xl p-8">
            <LucideClipboardList className="h-10 w-10 mx-auto text-primary" />
            <h3 className="text-xl font-semibold mt-6">Inventory Management</h3>
            <p className="text-sm mt-3">
              Multi-unit tracking, low stock alerts, stock adjustments and
              bundles.
            </p>
          </div>
          <div className="card bg-base-100 shadow-xl p-8">
            <LucideStore className="h-10 w-10 mx-auto text-primary" />
            <h3 className="text-xl font-semibold mt-6">Sales Monitoring</h3>
            <p className="text-sm mt-3">
              Track sales, voids, returns, VAT reports, X/Z-readings, and
              analytics.
            </p>
          </div>
          <div className="card bg-base-100 shadow-xl p-8">
            <LucideUsers className="h-10 w-10 mx-auto text-primary" />
            <h3 className="text-xl font-semibold mt-6">Role-Based Access</h3>
            <p className="text-sm mt-3">
              Admins, Managers, Cashiers, and Warehouse Staff with role-locked
              access.
            </p>
          </div>
        </div>
      </section>

      {/* Role Overview */}
      <section className="py-20 px-10 bg-base-100">
        <h2 className="text-4xl font-bold text-center mb-14">System Roles</h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Admin",
              desc: "Full system access and settings control.",
            },
            {
              title: "Manager",
              desc: "Manage inventory, sales, and approvals.",
            },
            {
              title: "Cashier",
              desc: "Handles real-time sales and receipts.",
            },
            {
              title: "Warehouse",
              desc: "Receives stock, adjusts inventory.",
            },
          ].map((role) => (
            <div
              key={role.title}
              className="card bg-base-200 p-6 shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-xl font-bold mb-2">{role.title}</h3>
              <p className="text-sm text-gray-600">{role.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-10 bg-base-200 text-center">
        <h2 className="text-4xl font-bold mb-12">
          Powered by Modern Technologies
        </h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {[
            "React",
            "Vite",
            "Tailwind",
            "DaisyUI",
            "Axios",
            "React Query",
            "Zustand",
            "Framer Motion",
            "React Hook Form",
            "Yup",
            "Day.js",
            "Lucide Icons",
            "Recharts",
          ].map((tech) => (
            <div
              key={tech}
              className="badge badge-primary badge-lg p-4 text-sm"
            >
              {tech}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-base-100 py-20 text-center">
        <h3 className="text-3xl font-semibold mb-6">
          Ready to use the POS System?
        </h3>
        <button className="btn btn-primary btn-lg gap-2">
          Launch Now <LucideArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
