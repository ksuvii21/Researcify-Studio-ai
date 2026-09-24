import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await login(formData);

      toast.success(
        response.message || "Login successful."
      );

      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {

      toast.error(
        error.message || "Unable to login."
      );

    } finally {

      setSubmitting(false);

    }
  };

  return (
    <div className="auth-card">

      <div className="auth-card-header">
        <h2>Welcome back</h2>

        <p>
          Sign in to continue your research.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="auth-form"
      >

        <div className="form-group">
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>


        <div className="form-group">
          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>


        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Signing in..."
            : "Sign In"}
        </button>

      </form>


      <p className="auth-switch">
        Don't have an account?{" "}

        <Link to="/register">
          Create account
        </Link>
      </p>

    </div>
  );
};

export default LoginPage;