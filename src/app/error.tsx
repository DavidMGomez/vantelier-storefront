"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty">
      <h1>No pudimos cargar la colección.</h1>
      <p>Intenta de nuevo en unos momentos.</p>
      <button className="button" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
