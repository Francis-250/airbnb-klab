import SearchBar from "../SearchBar";

export default function Hero() {
  return (
    <div
      style={{
        backgroundImage: "url('/image/hero-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="relative min-h-[58vh] md:min-h-[68vh] rounded-2xl flex flex-col items-center justify-center px-4 py-12 md:py-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/55 to-black/70 rounded-2xl" />
      <div className="relative z-10 flex flex-col items-center text-center mb-8 px-2">
        <h1
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-3xl sm:text-4xl md:text-6xl font-semibold text-white leading-tight max-w-xs sm:max-w-xl md:max-w-3xl mb-4"
        >
          Search &amp;{" "}
          <em className="text-(--color-primary) not-italic">Discover</em>
          <br className="hidden sm:block" /> Nearby Landmarks
        </h1>
        <p className="text-sm md:text-base font-light text-white/50 max-w-xs sm:max-w-sm md:max-w-md leading-relaxed">
          Browse our detailed listings to explore everything in your area.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-xs sm:max-w-xl md:max-w-3xl px-2 sm:px-0">
        <SearchBar />
      </div>
    </div>
  );
}
