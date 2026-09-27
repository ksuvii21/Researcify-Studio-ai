import {
  ArrowRight,
  Mail,
  UserRound,
} from "lucide-react";

import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import PasswordStrength from "../../components/auth/PasswordStrength";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  agree: false,
};

const RegisterPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [form, setForm] =
    useState(initialForm);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

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

    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (form.name.trim().length < 2) {
      nextErrors.name =
        "Enter your full name.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (form.password.length < 8) {
      nextErrors.password =
        "Password must contain at least 8 characters.";
    }

    if (
      form.confirmPassword !==
      form.password
    ) {
      nextErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (!form.agree) {
      nextErrors.agree =
        "You must accept the terms to continue.";
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
      await auth.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      setServerError(
        error?.message ||
          "Unable to create your account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-card">
      <div className="auth-card__heading">
        <span className="auth-card__eyebrow">
          Start researching smarter
        </span>

        <h1>Create your account</h1>

        <p>
          Build your intelligent research
          workspace in minutes.
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
          id="register-name"
          label="Full Name"
          icon={UserRound}
          name="name"
          value={form.name}
          onChange={updateField}
          placeholder="Your full name"
          autoComplete="name"
          error={errors.name}
          required
        />

        <AuthInput
          id="register-email"
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
          id="register-password"
          label="Password"
          name="password"
          value={form.password}
          onChange={updateField}
          placeholder="Create a secure password"
          autoComplete="new-password"
          error={errors.password}
          required
        />

        <PasswordStrength
          password={form.password}
        />

        <PasswordInput
          id="confirm-password"
          label="Confirm Password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={updateField}
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          required
        />

        <div>
          <label className="auth-checkbox auth-checkbox--terms">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={updateField}
            />

            <span>
              I agree to the{" "}
              <a href="/terms">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy">
                Privacy Policy
              </a>
              .
            </span>
          </label>

          {errors.agree && (
            <small className="auth-field__error">
              {errors.agree}
            </small>
          )}
        </div>

        <button
          type="submit"
          className="auth-submit"
          disabled={submitting}
        >
          {submitting
            ? "Creating account..."
            : "Create Account"}

          {!submitting && (
            <ArrowRight size={16} />
          )}
        </button>
      </form>

      <div className="auth-card__switch">
        <span>
          Already have an account?
        </span>

        <Link to="/login">
          Sign in
        </Link>
      </div>
    </section>
  );
};

export default RegisterPage;