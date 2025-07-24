// src/pages/LoginPage.tsx
import { useForm } from "react-hook-form";
import { login } from "../services/authService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";

type LoginFormInputs = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    try {
      // 1. Call your authService.login()
      const result = await login(data);

      // 2. Persist into Zustand store (also writes to localStorage internally)
      setAuth({ token: result.token, role: result.role });

      toast.success("Login successful!");

      // 3. Navigate based on role
      switch (result.role) {
        case "Admin":
          navigate("/dashboard/admin");
          break;
        case "Manager":
          navigate("/dashboard/manager");
          break;
        case "Cashier":
          navigate("/dashboard/cashier");
          break;
        case "Warehouse":
          navigate("/dashboard/warehouse");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message || "Invalid login credentials";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-base-200">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="card w-96 bg-base-100 shadow-xl p-6 space-y-4"
      >
        <h2 className="text-xl font-bold text-center">User Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}

        <input
          type="password"
          placeholder="Password"
          className="input input-bordered w-full"
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full flex justify-center items-center gap-2"
        >
          {loading && <span className="loading loading-spinner"></span>}
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
