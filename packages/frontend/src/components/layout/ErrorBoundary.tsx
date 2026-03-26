import { Component, type ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.log('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <ErrorFallback
            title="Something went wrong"
            message="The application encountered an unexpected error. Please refresh the page."
            onRetry={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
