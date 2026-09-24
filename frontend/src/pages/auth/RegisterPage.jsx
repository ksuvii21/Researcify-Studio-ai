import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    academicField: "",
    researchInterests: "",
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

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.academicField
    ) {
      toast.error(
        "Please complete all required fields."
      );

      return;
    }

    if (formData.password.length < 6) {
      toast.error(
        "Password must be at least 6 characters."
      );

      return;
    }


    const interests = formData.researchInterests
      .split(",")
      .map((interest) => interest.trim())
      .filter(Boolean);


    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      academicField:
        formData.academicField.trim(),
      researchInterests: interests,
    };


    try {

      setSubmitting(true);

      const response =
        await register(payload);

      toast.success(
        response.message ||
        "Account created successfully."
      );

      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {

      toast.error(
        error.message ||
        "Unable to create account."
      );

    } finally {

      setSubmitting(false);

    }
  };


  return (
    <div className="auth-card">

      <div className="auth-card-header">

        <h2>Create your account</h2>

        <p>
          Start building your research workspace.
        </p>

      </div>


      <form
        onSubmit={handleSubmit}
        className="auth-form"
      >

        <div className="form-group">

          <label htmlFor="name">
            Full Name
          </label>

          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
          />

        </div>


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
            placeholder="Minimum 6 characters"
          />

        </div>


        <div className="form-group">

          <label htmlFor="academicField">
            Academic Field
          </label>

          <input
            id="academicField"
            name="academicField"
            value={formData.academicField}
            onChange={handleChange}
            placeholder="e.g. Computer Science"
          />

        </div>


        <div className="form-group">

          <label htmlFor="researchInterests">
            Research Interests
          </label>

          <input
            id="researchInterests"
            name="researchInterests"
            value={formData.researchInterests}
            onChange={handleChange}
            placeholder="AI, Machine Learning, NLP"
          />

          <small>
            Separate interests using commas.
          </small>

        </div>


        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Creating account..."
            : "Create Account"}
        </button>

      </form>


      <p className="auth-switch">
        Already have an account?{" "}

        <Link to="/login">
          Sign in
        </Link>
      </p>

    </div>
  );
};

export default RegisterPage;