import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // If the error is an AbortError or benign cancellation, don't show the crash screen
    const msg = (error?.message || '').toLowerCase();
    const name = error?.name || '';
    if (
      name === 'AbortError' ||
      msg.includes('user aborted') ||
      msg.includes('signal is aborted') ||
      msg.includes('aborted')
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const msg = (error?.message || '').toLowerCase();
    const name = error?.name || '';
    if (
      name === 'AbortError' ||
      msg.includes('user aborted') ||
      msg.includes('signal is aborted') ||
      msg.includes('aborted')
    ) {
      return;
    }
    console.error('PawBook Pro ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F1EEE6] flex items-center justify-center p-6 text-[#173E39]">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-[#E7E2D6] text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E08A5B]/15 flex items-center justify-center text-[#E08A5B]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold font-serif mb-2 text-[#173E39]">PawBook Pro Notice</h1>
            <p className="text-sm text-[#5B6E6A] mb-6 leading-relaxed">
              Something unexpected happened while processing your request. Your salon data is safely stored in Firebase Firestore.
            </p>
            <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E7E2D6] text-left mb-6 text-xs font-mono text-[#5B6E6A] overflow-auto max-h-32">
              {this.state.error?.message || 'Unknown application error'}
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#1C3B3A] text-white rounded-xl font-medium hover:bg-[#152e2d] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Studio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
