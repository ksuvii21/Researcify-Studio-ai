import useAuth from "../hooks/useAuth";

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <section>

      <h1>
        Welcome back, {user?.name}
      </h1>

      <p>
        Your research workspace is ready.
      </p>


      <div>

        <h3>Account</h3>

        <p>
          Email: {user?.email}
        </p>

        <p>
          Academic Field:{" "}
          {user?.academicField}
        </p>

      </div>


      <div>

        <h3>Research Interests</h3>

        {user?.researchInterests?.length ? (

          <ul>
            {user.researchInterests.map(
              (interest) => (
                <li key={interest}>
                  {interest}
                </li>
              )
            )}
          </ul>

        ) : (

          <p>
            No research interests added.
          </p>

        )}

      </div>

    </section>
  );
};

export default DashboardPage;