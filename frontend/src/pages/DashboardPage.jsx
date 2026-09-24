import useAuth from "../hooks/useAuth";


const DashboardPage = () => {
  const {
    user,
    logout,
  } = useAuth();


  return (
    <div>
      <h1>Researcify Studio</h1>

      <h2>
        Welcome, {user?.name}
      </h2>

      <p>
        {user?.email}
      </p>

      <p>
        Academic Field: {user?.academicField}
      </p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
};


export default DashboardPage;