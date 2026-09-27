const calculateStrength = (password) => {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return {
      score: 1,
      label: "Weak",
    };
  }

  if (score <= 3) {
    return {
      score: 2,
      label: "Fair",
    };
  }

  if (score === 4) {
    return {
      score: 3,
      label: "Good",
    };
  }

  return {
    score: 4,
    label: "Strong",
  };
};

const PasswordStrength = ({ password }) => {
  if (!password) return null;

  const strength =
    calculateStrength(password);

  return (
    <div className="password-strength">
      <div className="password-strength__header">
        <span>Password strength</span>

        <strong
          data-strength={strength.score}
        >
          {strength.label}
        </strong>
      </div>

      <div className="password-strength__bars">
        {[1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={
              level <= strength.score
                ? "is-active"
                : ""
            }
            data-strength={strength.score}
          />
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;