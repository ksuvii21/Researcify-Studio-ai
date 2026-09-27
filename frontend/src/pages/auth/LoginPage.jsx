import {
  ArrowRight,
  Mail,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";

const LoginPage = () => {
  const auth = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    setServerError("");
  }, [form.email, form.password]);

  const updateField = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email =
        "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password =
        "Password is required.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setServerError("");

    try {
      await auth.login({
        email: form.email.trim(),
        password: form.password,
        remember: form.remember,
      });

      const destination =
        location.state?.from?.pathname ||
        "/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      setServerError(
        error?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-card">
      <div className="auth-card__heading">
        <span className="auth-card__eyebrow">
          Welcome back
        </span>

        <h1>Sign in to Researcify</h1>

        <p>
          Continue your research from where you
          left off.
        </p>
      </div>

      {serverError && (
        <div
          className="auth-alert auth-alert--error"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <AuthInput
          id="login-email"
          label="Email Address"
          icon={Mail}
          type="email"
          name="email"
          value={form.email}
          onChange={updateField}
          placeholder="researcher@example.com"
          autoComplete="email"
          error={errors.email}
          required
        />

        <PasswordInput
          id="login-password"
          label="Password"
          name="password"
          value={form.password}
          onChange={updateField}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
          required
        />

        <div className="auth-form__options">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={updateField}
            />

            <span>Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            className="auth-link"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="auth-submit"
          disabled={submitting}
        >
          {submitting
            ? "Signing in..."
            : "Sign In"}

          {!submitting && (
            <ArrowRight size={16} />
          )}
        </button>
      </form>

      <div className="auth-card__switch">
        <span>
          New to Researcify?
        </span>

        <Link to="/register">
          Create an account
        </Link>
      </div>

      <p className="auth-card__terms">
        By continuing, you agree to the
        Researcify Studio Terms of Service and
        Privacy Policy.
      </p>
    </section>
  );
};

export default LoginPage;