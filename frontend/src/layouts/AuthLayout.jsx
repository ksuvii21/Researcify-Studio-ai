import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <main className="auth-layout">
      <section className="auth-brand">
        <h1>Researcify Studio</h1>

        <p>
          Your AI-powered workspace for discovering,
          organizing and understanding research.
        </p>
      </section>

      <section className="auth-content">
        <Outlet />
      </section>
    </main>
  );
};

export default AuthLayout;