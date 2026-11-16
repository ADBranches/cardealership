import { Component, type ReactNode } from "react";

export function RouteLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6" aria-busy="true">
      <div role="status" className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div aria-hidden="true" className="mx-auto mb-5 h-9 w-9 rounded-full border-4 border-slate-200 border-t-slate-700 motion-safe:animate-spin" />
        <p className="text-base font-semibold text-slate-900">Loading page</p>
        <p className="mt-2 text-sm text-slate-600">Please wait a moment.</p>
      </div>
    </main>
  );
}

export class RouteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm" aria-labelledby="route-error-title">
          <h1 id="route-error-title" className="text-xl font-semibold text-slate-900">Unable to load this page</h1>
          <p role="alert" className="mt-3 text-sm leading-relaxed text-slate-600">A temporary problem occurred. Reload the page to try again, or return to the homepage.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Reload page</button>
            <a href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Go home</a>
          </div>
        </section>
      </main>
    );
  }
}
