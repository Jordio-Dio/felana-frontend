import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArtisanBanner } from "@/components/shop/ArtisanBanner";
import { ShopLayout } from "@/components/layout/ShopLayout";

function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#f6efe4] px-6 py-16 sm:rounded-3xl sm:px-10 sm:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.7fr)] lg:gap-8">
        <div className="text-center lg:text-left">
          <h1 className="font-serif text-3xl font-bold leading-tight !text-[#000000] opacity-100 sm:text-4xl">
            Révélez tout le charme de fait main
          </h1>
          <p className="mt-3 text-lg text-gray-700">Artisanal, Unique, Made in Toamasina.</p>
          <Link to="/shop" className="mt-6 inline-block text-base font-medium text-[#8a6f56] underline underline-offset-4 transition-colors hover:text-[#6f5a45]">
            Découvrir la collection
          </Link>
        </div>

        <div className="relative mx-auto h-56 w-full max-w-sm sm:h-72 sm:max-w-md">
          <div className="absolute bottom-0 left-1/2 h-6 w-40 -translate-x-1/2 rounded-full bg-amber-100/70 sm:w-56" />
          <img src="/images/sac-blanc.jpg" alt="Sac en crochet blanc fait main" className="absolute bottom-4 left-1/2 z-10 h-32 w-32 -translate-x-[85%] rotate-[-8deg] rounded-2xl object-cover shadow-lg transition-transform duration-300 hover:-translate-y-1 sm:h-44 sm:w-44" />
          <img src="/images/sac-vert.jpg" alt="Sac en crochet vert fait main" className="absolute bottom-4 left-1/2 z-0 h-28 w-28 translate-x-[10%] rotate-[6deg] rounded-2xl object-cover shadow-md transition-transform duration-300 hover:-translate-y-1 sm:h-40 sm:w-40" />
          <img src="/images/sac-rose.jpg" alt="Sac en crochet rose fait main" className="absolute bottom-6 left-1/2 z-20 h-36 w-36 -translate-x-1/2 rounded-2xl object-cover shadow-xl transition-transform duration-300 hover:-translate-y-1 sm:h-48 sm:w-48" />
        </div>

        <div className="flex flex-col items-center gap-4 lg:items-end">
          <img src="/images/createuse.jpg" alt="Hiba, créatrice des sacs en crochet artisanaux" className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-md sm:h-20 sm:w-20" />
          <div className="text-center lg:text-right">
            <p className="text-xl font-bold text-gray-900">10K+</p>
            <p className="text-xs text-gray-500">Happy Customers</p>
          </div>
          <div className="text-center lg:text-right">
            <p className="text-xl font-bold text-gray-900">4.8</p>
            <p className="text-xs text-gray-500">Average Rating</p>
            <div className="mt-1 flex justify-center gap-0.5 lg:justify-end" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryCards() {
  const categories = [
    { name: "Sacs & Paniers en Raphia", img: "/images/sac-rose.jpg", desc: "Des sacs et paniers tissés à la main avec du raphia naturel." },
    { name: "Bijoux Artisanaux", img: "/images/sac-vert.jpg", desc: "Bijoux uniques façonnés avec passion et précision." },
    { name: "Décoration d'Intérieur", img: "/images/sac-blanc.jpg", desc: "Pièces de décoration qui apportent chaleur et caractère." },
  ];

  return (
    <section className="mt-16">
      <div className="text-center mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#8a6f56]">Nos collections</span>
        <h2 className="mt-2 text-3xl font-bold text-[#3b2f24] sm:text-4xl">Découvrez nos catégories</h2>
        <p className="mt-3 text-[#8a8276] max-w-2xl mx-auto">Chaque pièce raconte une histoire — celle d'un village, d'une main habile, d'un fil transformé en masterpiece.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {categories.map((cat, idx) => (
          <motion.div key={idx} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-soft)] transition-all duration-200 ease-out hover:shadow-xl hover:ring-2 hover:ring-[#8a6f56]/20">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-3xl bg-[#f6efe4]">
              <img src={cat.img} alt={cat.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                <p className="mt-1 text-sm text-white/80">{cat.desc}</p>
                <Link to="/shop" className="mt-3 inline-block text-sm font-medium text-white underline underline-offset-4 transition-colors hover:text-[#E86F3D]">
                  Acheter →
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryCards />
      <ArtisanBanner onExplore={() => {}} />
    </>
  );
}