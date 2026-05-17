import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="critical-error-screen" className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 animate-pulse">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
            System Error Detected
          </h1>
          
          <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
            Terjadi kesalahan fatal pada aplikasi. Tim pengembang (Antigravity AI) telah mendeteksi kendala ini.
          </p>

          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 mb-8 max-w-2xl w-full text-left overflow-auto max-h-[300px]">
            <p className="text-xs font-mono text-red-400 mb-2 font-bold uppercase tracking-widest">Error Trace:</p>
            <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap break-all bg-black/30 p-4 rounded-xl border border-white/5">
              {this.state.error?.stack || this.state.error?.toString()}
              {"\n\nComponent Stack:\n"}
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Aplikasi
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              className="flex-1 px-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-all active:scale-95 border border-slate-700"
            >
              Reset Cache & Home
            </button>
          </div>
          
          <p className="mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">
            Alfath Pulsa Management System
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
