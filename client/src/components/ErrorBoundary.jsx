import React, { Component } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Application Crash Caught by ErrorBoundary]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/events';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#002B55] tracking-tight">
                An Unexpected Error Occurred
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                The university portal encountered an unexpected display issue. Your saved passes and registration records remain secure.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left overflow-auto max-h-36 text-[10px] font-mono text-rose-700">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#002B55] hover:bg-[#001B36] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Home className="w-3.5 h-3.5 text-[#002B55]" />
                <span>Return to Events</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

