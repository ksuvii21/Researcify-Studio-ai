import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, info) {
    console.error(
      "Application error:",
      error,
      info
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fatal-error">

          <h1>Something went wrong</h1>

          <p>
            Researcify Studio encountered an
            unexpected error.
          </p>

          <button onClick={this.handleReload}>
            Reload Application
          </button>

        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;