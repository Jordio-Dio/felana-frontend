import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { ArtisanBanner } from "@/components/shop/ArtisanBanner";

// Typage explicite des variantes Framer Motion pour TypeScript
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#FAF6F4] via-[#F6EFE4] to-[#EFE3D3] px-6 py-12 sm:px-10 sm:py-16 lg:py-20">
      {/* Motif décoratif d'arrière-plan */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#8B3A1C]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#E86F3D]/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr_0.8fr] lg:gap-8">
        
        {/* Colonne Gauche : Titre & CTA */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center lg:text-left"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8B3A1C]/10 px-3.5 py-1.5 text-xs font-semibold text-[#8B3A1C]">
            <Sparkles className="h-3.5 w-3.5" />
            Fait Main à Toamasina
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl lg:leading-[1.15]">
            Révélez tout le charme du <span className="text-[#8B3A1C]">fait main</span>
          </h1>

          <p className="mt-4 text-base text-stone-600 sm:text-lg">
            Des créations artisanales uniques, façonnées avec passion, élégance et authenticité.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#8B3A1C] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#8B3A1C]/25 transition-all hover:bg-[#722F17] hover:shadow-xl hover:shadow-[#8B3A1C]/35 active:scale-95"
            >
              Découvrir la collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* Colonne Centre : Composition des images de sacs */}
        <div className="relative mx-auto flex h-64 w-full max-w-sm items-center justify-center sm:h-80 sm:max-w-md">
          {/* Ombre portée au sol */}
          <div className="absolute bottom-2 h-6 w-48 rounded-full bg-[#8B3A1C]/15 blur-md sm:w-64" />

          {/* Sac Blanc (Gauche) */}
          <motion.img
            initial={{ opacity: 0, x: -30, rotate: -12 }}
            animate={{ opacity: 1, x: "-85%", rotate: -8 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            src="/images/sac-blanc.jpg"
            alt="Sac en crochet blanc fait main"
            className="absolute bottom-6 left-1/2 z-10 h-36 w-36 rounded-2xl object-cover shadow-lg ring-4 ring-white transition-transform duration-300 hover:z-30 hover:scale-105 sm:h-48 sm:w-48"
          />

          {/* Sac Vert (Droite) */}
          <motion.img
            initial={{ opacity: 0, x: 30, rotate: 12 }}
            animate={{ opacity: 1, x: "10%", rotate: 6 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            src="/images/sac-vert.jpg"
            alt="Sac en crochet vert fait main"
            className="absolute bottom-6 left-1/2 z-0 h-32 w-32 rounded-2xl object-cover shadow-md ring-4 ring-white transition-transform duration-300 hover:z-30 hover:scale-105 sm:h-44 sm:w-44"
          />

          {/* Sac Rose (Centre) */}
          <motion.img
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            src="/images/sac-rose.jpg"
            alt="Sac en crochet rose fait main"
            className="absolute bottom-8 left-1/2 z-20 h-40 w-40 rounded-2xl object-cover shadow-2xl ring-4 ring-white transition-transform duration-300 hover:scale-105 sm:h-52 sm:w-52"
          />
        </div>

        {/* Colonne Droite : Preuve sociale & Artisan */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col items-center gap-6 rounded-3xl border border-white/60 bg-white/40 p-6 backdrop-blur-md lg:items-end lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
        >
          {/* Portrait Créatrice */}
          <div className="flex items-center gap-3 lg:flex-row-reverse">
            <img
              src="/images/createuse.jpg"
              alt="Hiba, créatrice des sacs en crochet"
              className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-md ring-2 ring-[#8B3A1C]/20 sm:h-20 sm:w-20"
            />
            <div className="text-left lg:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8B3A1C]">Créatrice</p>
              <p className="text-sm font-bold text-stone-900">Hiba</p>
            </div>
          </div>

          <div className="h-px w-12 bg-stone-300/60 hidden lg:block" />

          {/* Statistiques */}
          <div className="flex justify-around gap-8 text-center lg:flex-col lg:gap-4 lg:text-right">
            <div>
              <p className="font-mono text-2xl font-black text-stone-900 sm:text-3xl">10K+</p>
              <p className="text-xs font-medium text-stone-500">Clients satisfaits</p>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 lg:justify-end">
                <span className="font-mono text-xl font-bold text-stone-900">4.8</span>
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="mt-0.5 text-xs font-medium text-stone-500">Note moyenne</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

function CategoryCards() {
  const categories = [
    {
      name: "Sacs & Paniers en Raphia",
      img: "/images/sac-rose.jpg",
      desc: "Des pièces tissées à la main avec du raphia naturel sélectionné.",
    },
    {
      name: "Bijoux Artisanaux",
      img: "/images/sac-vert.jpg",
      desc: "Créations uniques façonnées avec passion et précision.",
    },
    {
      name: "Décoration d'Intérieur",
      img: "/images/sac-blanc.jpg",
      desc: "Objets authentiques pour apporter de la chaleur à votre intérieur.",
    },
  ];

  return (
    <section className="mt-20">
      {/* En-tête de section */}
      <div className="mb-12 text-center">
        <span className="rounded-full bg-[#FAF6F4] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#8B3A1C]">
          Nos Collections
        </span>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
          Découvrez nos univers
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-stone-500 sm:text-base">
          Chaque pièce raconte une histoire — celle d'un savoir-faire préservé et d'un fil transformé en œuvre d'art.
        </p>
      </div>

      {/* Grille de cartes */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {categories.map((cat, idx) => (
          <motion.div
            key={idx}
            variants={fadeInUp}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.25 }}
            className="group relative overflow-hidden rounded-3xl border border-[#F2E6E1] bg-white shadow-lg shadow-[#8B3A1C]/5 transition-all duration-300 hover:shadow-2xl hover:shadow-[#8B3A1C]/15"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#FAF6F4]">
              <img
                src={cat.img}
                alt={cat.name}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              
              {/* Overlay Gradient sombre progressif */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

              {/* Contenu de la carte */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-[#F6EFE4]">
                  {cat.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs text-stone-300 sm:text-sm">
                  {cat.desc}
                </p>
                
                <Link
                  to="/shop"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E86F3D] transition-colors hover:text-white"
                >
                  Découvrir
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-12 pb-12">
      <HeroSection />
      <CategoryCards />
      <ArtisanBanner onExplore={() => {}} />
    </div>
  );
}