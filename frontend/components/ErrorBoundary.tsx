import { Component, type ReactNode } from 'react';
// import { ErrorPage } from '@/pages/ErrorPage';
const ErrorPage = ({ error, resetError }: any) => (
  <div className="p-8 text-center bg-ct-bg min-h-screen flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold text-ct-accent mb-4">Something went wrong</h1>
    <p className="text-ct-text-secondary mb-8">{error?.message || 'An unexpected error occurred'}</p>
    <button 
      onClick={resetError}
      className="px-6 py-2 bg-ct-accent text-ct-bg rounded-lg font-bold hover:bg-ct-accent/90 transition-colors"
    >
      Try again
    </button>
  </div>
);

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | undefined;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorPage error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}
