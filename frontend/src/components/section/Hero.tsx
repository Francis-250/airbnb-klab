import SearchBar from "../SearchBar";

export default function Hero() {
  return (
    <div
      style={{
        backgroundImage: "url('/image/hero-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="relative min-h-[70vh] rounded-md flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60 rounded-md" />

      <div className="relative z-10 flex flex-col items-center text-center mb-5">
        <h1 className="text-3xl md:text-5xl font-semibold text-white leading-snug max-w-2xl mb-4">
          Search &amp;
          <em className="text-(--color-primary) not-italic mx-2">Discover</em>
          Nearby
          <br className="hidden md:block" /> Landmarks Around You
        </h1>
        <p className="text-sm md:text-base font-light text-white/60 max-w-md leading-relaxed">
          Browse our detailed listings to explore everything in your area.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <SearchBar />
      </div>
    </div>
  );
}
