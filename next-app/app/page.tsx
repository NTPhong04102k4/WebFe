export default function Page() {
  return (
    <main className="space-y-5">
      <h1 className="text-3xl font-semibold">Next.js showcase</h1>
      <p className="text-neutral-300">
        This folder is a minimal Next.js app (App Router) added alongside the
        main Vite app.
      </p>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <div className="text-sm text-neutral-400">Tips for interviews</div>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-neutral-200">
          <li>
            Talk about why you choose SSR/SSG for SEO pages (listings, landing),
            and keep dashboards as SPA.
          </li>
          <li>
            Explain auth/OAuth tradeoffs in SSR (no localStorage on server).
          </li>
        </ul>
      </div>
    </main>
  );
}

