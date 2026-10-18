import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="error-box" role="alert">
      <div><h1>Something went wrong.</h1>
        <p>Reload the dashboard to start a fresh session.</p>
        <button className="button primary" onClick={() => location.reload()}>Reload dashboard</button>
      </div>
    </main>;
  }
}
