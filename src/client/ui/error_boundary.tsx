// [UI-S01/MSS][IMP-86] Root Error Boundary — Fallback defense against uncaught 3D/React crashes
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

export interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: (error: Error, reset: () => void) => ReactNode;
}

export interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[AppErrorBoundary] Uncaught UI/WebGL Error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      return (
        <div
          role="alert"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center text-slate-100 backdrop-blur-md"
        >
          <div className="max-w-md rounded-2xl border border-rose-500/40 bg-slate-900/90 p-6 shadow-2xl">
            <div className="mb-3 text-4xl">⚠️</div>
            <h2 className="mb-2 text-xl font-bold tracking-tight text-white">
              Đã Xảy Ra Sự Cố Giao Diện
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-rose-200">
              {this.state.error?.message || 'Sự cố kết xuất giao diện'}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-amber-950 transition hover:bg-amber-400 active:scale-95"
            >
              Thử Lại (Tải lại trang)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
