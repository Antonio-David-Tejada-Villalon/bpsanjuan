import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="section container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: 'var(--danger)' }}>Algo salió mal</h2>
          <p style={{ color: 'var(--text-soft)', marginBottom: 24 }}>
            Ocurrió un error inesperado. Intentá recargar la página.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Recargar página
          </button>
          {import.meta.env.DEV && (
            <pre style={{ marginTop: 24, textAlign: 'left', fontSize: 12, color: 'var(--danger)', background: 'rgba(214,69,69,0.06)', padding: 16, borderRadius: 8, overflow: 'auto' }}>
              {this.state.error?.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
