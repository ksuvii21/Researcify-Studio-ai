const AuthDivider = ({
  text = "or continue with",
}) => {
  return (
    <div className="auth-divider">
      <span />
      <p>{text}</p>
      <span />
    </div>
  );
};

export default AuthDivider;