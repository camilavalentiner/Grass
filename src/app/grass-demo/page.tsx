/** A tall, mostly empty page used to review the grass animation while scrolling. */
export default function GrassDemo() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 flex flex-col gap-[60vh]">
      {["Scroll to see the grass pull back along its strokes", "Keep going", "Stop scrolling and watch it draw back in", "The end"].map((t) => (
        <section key={t} className="card px-5 py-3 text-center text-sm text-text-blue">{t}</section>
      ))}
    </main>
  );
}
