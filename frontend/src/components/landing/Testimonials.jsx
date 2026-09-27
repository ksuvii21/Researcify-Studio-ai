const testimonials = [
  {
    quote:
      "Having papers, notes and AI analysis in one workspace makes literature review much easier to manage.",
    initials: "CS",
    role: "Computer Science Student",
  },
  {
    quote:
      "The project-based research workflow makes it easier to preserve context while moving between multiple papers.",
    initials: "AR",
    role: "Academic Researcher",
  },
  {
    quote:
      "I can see how the connected library and AI comparison workflow could simplify dissertation research significantly.",
    initials: "PR",
    role: "Postgraduate Researcher",
  },
];

const Testimonials = () => {
  return (
    <section className="landing-section landing-section--alternate">
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading--center">
          <span>Research Experiences</span>

          <h2>
            Designed around the way
            <br />
            <em>researchers actually work.</em>
          </h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map(({ quote, initials, role }) => (
            <article className="testimonial-card" key={role}>
              <p>“{quote}”</p>

              <div className="testimonial-person">
                <div>{initials}</div>

                <span>
                  <strong>{role}</strong>
                  <small>Prototype testimonial</small>
                </span>
              </div>
            </article>
          ))}
        </div>

        <p className="testimonial-disclaimer">
          Demonstration content for the Researcify Studio prototype.
        </p>
      </div>
    </section>
  );
};

export default Testimonials;