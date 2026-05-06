import SearchBar from "../SearchBar";

export default function Hero() {
  return (
    <div
      style={{
        backgroundImage: "url('/image/hero-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="relative min-h-[60vh] md:min-h-[70vh] rounded-md flex flex-col items-center justify-center px-4 py-12 md:py-0"
    >
      <div className="absolute inset-0 bg-black/60 rounded-md" />
      <div className="relative z-10 flex flex-col items-center text-center mb-6 md:mb-5 px-2">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-white leading-snug max-w-xs sm:max-w-lg md:max-w-2xl mb-3 md:mb-4">
          Search &amp;
          <em className="text-(--color-primary) not-italic mx-2">Discover</em>
          Nearby
          <br className="hidden md:block" /> Landmarks Around You
        </h1>
        <p className="text-xs sm:text-sm md:text-base font-light text-white/60 max-w-xs sm:max-w-sm md:max-w-md leading-relaxed">
          Browse our detailed listings to explore everything in your area.
        </p>
      </div>
      <div className="relative z-10 w-full max-w-xs sm:max-w-xl md:max-w-3xl px-2 sm:px-0">
        <SearchBar />
      </div>
    </div>
  );
}
