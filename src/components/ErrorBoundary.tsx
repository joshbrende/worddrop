/**
 * ErrorBoundary - Catches React errors and displays fallback UI
 * Prevents entire app from crashing on component errors
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Game Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
    
    // TODO: Log to error tracking service (e.g., Sentry) in production
    if (import.meta.env.PROD) {
      // Send to error tracking service
      // errorTrackingService.logError(error, errorInfo);
    }
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2 className="error-boundary-title">Oops! Something went wrong</h2>
            <p className="error-boundary-message">
              An unexpected error occurred. Please try again or reload the page.
            </p>
            
            <div className="error-boundary-actions">
              <button 
                className="error-boundary-button error-boundary-button-retry"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              <button 
                className="error-boundary-button error-boundary-button-reload"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="error-boundary-details">
                <h3>Error Details (Development Only)</h3>
                <pre className="error-boundary-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
