import {
  ArrowLeft,
  ArrowRight,
  Mail,
} from "lucide-react";

import { useState } from "react";

import { Link } from "react-router-dom";

import AuthInput from "../../components/auth/AuthInput";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] =
    useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      setError(
        "Enter a valid email address."
      );

      return;
    }

    setError("");

    // Password reset API comes when
    // reset-token backend flow exists.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="auth-card">
        <div className="auth-success">
          <span className="auth-success__icon">
            <Mail size={22} />
          </span>

          <h1>Check your email</h1>

          <p>
            If an account exists for{" "}
            <strong>{email}</strong>, password
            reset instructions will be sent to
            that address once the reset service
            is enabled.
          </p>

          <Link
            to="/login"
            className="auth-submit"
          >
            <ArrowLeft size={15} />
            Back to Sign In
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-card">
      <Link
        to="/login"
        className="auth-back-link"
      >
        <ArrowLeft size={14} />
        Back to sign in
      </Link>

      <div className="auth-card__heading">
        <span className="auth-card__eyebrow">
          Account recovery
        </span>

        <h1>Forgot your password?</h1>

        <p>
          Enter your email address to begin
          recovering your account.
        </p>
      </div>

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
        <AuthInput
          id="reset-email"
          label="Email Address"
          icon={Mail}
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
          }}
          placeholder="researcher@example.com"
          error={error}
          autoFocus
          required
        />

        <button
          type="submit"
          className="auth-submit"
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </form>
    </section>
  );
};

export default ForgotPasswordPage;