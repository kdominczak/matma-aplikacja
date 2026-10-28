/**
 * Rozmyte plamy światła (niebieska i fioletowa) za treścią ekranu głównego.
 * W jasnym motywie ledwo widoczne, w ciemnym dają głębię. Powoli „pływają” (animate-drift).
 */
import FloatingSymbols from "@/components/layout/FloatingSymbols";

export default function GlowBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 animate-fade-in overflow-hidden lg:left-72">
      <div className="absolute -top-40 -left-32 h-112 w-md animate-drift rounded-full bg-blue-500/8 blur-3xl will-change-transform dark:bg-blue-500/20" />
      <div className="absolute top-1/4 -right-40 h-128 w-lg animate-drift rounded-full bg-violet-500/8 blur-3xl will-change-transform [animation-delay:-8s] dark:bg-violet-500/20" />
      <div className="absolute -bottom-48 left-1/4 h-104 w-104 animate-drift rounded-full bg-indigo-500/6 blur-3xl will-change-transform [animation-delay:-16s] dark:bg-fuchsia-500/12" />
      <FloatingSymbols />
    </div>
  );
}
