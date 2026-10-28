/**
 * Rozmyte plamy światła (niebieska i fioletowa) za treścią ekranu głównego.
 * W jasnym motywie ledwo widoczne, w ciemnym dają głębię. Powoli „pływają” (animate-drift).
 *
 * Wydajność: miękkie brzegi daje sam gradient radialny (`.glow-blob`), bez `filter: blur` –
 * rozmycie 64 px na dużych warstwach było najdroższe przy każdym przemalowaniu. Animujemy tylko
 * `transform`, więc ruch liczy kompozytor (GPU), a nie główny wątek. `contain` odcina tło od układu strony.
 */
import FloatingSymbols from "@/components/layout/FloatingSymbols";

export default function GlowBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 animate-fade-in overflow-hidden [contain:strict] lg:left-72">
      <div className="glow-blob glow-blue absolute -top-40 -left-32 h-112 w-md animate-drift" />
      <div className="glow-blob glow-violet absolute top-1/4 -right-40 h-128 w-lg animate-drift [animation-delay:-8s]" />
      <div className="glow-blob glow-fuchsia absolute -bottom-48 left-1/4 h-104 w-104 animate-drift [animation-delay:-16s]" />
      <FloatingSymbols />
    </div>
  );
}
