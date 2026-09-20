import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithSkeleton } from "@/components/shared/ImageWithSkeleton";
import type { ArticlePublic } from "@/types/shop.types";
import { motion } from "framer-motion";

interface ShopHeroProps {
    highlights: ArticlePublic[];
    onExplore: () => void;
    onSelectCategory: (categorie: string) => void;
}




export function ShopHero({ highlights, onExplore, onSelectCategory }: ShopHeroProps) {

    const textToType = "Révélez tout le charme \nde fait main";

    // Configurations de l'animation typewriter pour chaque caractère du texte
    const sentenceVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05, // Délai entre chaque caractère
            },
        },
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <section id="hero" className="relative overflow-hidden rounded-3xl">
            {/* Photo de fond */}
            <div className="relative h-[420px] sm:h-[480px]">
                <img
                    src="/images/hero-bg.jpg"
                    alt="Ambiance atelier artisanal Hiba Créations"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

                <div className="relative z-[1] flex h-full flex-col justify-center px-6 sm:px-10">
                    <motion.h1
                        variants={sentenceVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-lg font-serif text-3xl font-bold leading-tight text-white sm:text-5xl"
                    >
                        {textToType.split("").map((char, index) => (
                            <motion.span key={index} variants={letterVariants}>
                                {char === "\n" ? <br /> : char}
                            </motion.span>
                        ))}
                    </motion.h1>
                    <p className="mt-3 max-w-md text-sm text-white/90 sm:text-base">
                        Artisanal, Unique, Made in Toamasina.
                    </p>
                    <Button
                        onClick={onExplore}
                        className="mt-6 w-fit rounded-none bg-[#6b4226] px-6 py-5 text-sm font-medium text-white shadow-md transition-all duration-300 hover:scale-[1.03] hover:bg-[#54331d]"
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Découvrir la collection
                    </Button>
                </div>
            </div>

            {/* Cartes catégories, chevauchent le bas du hero */}
            {highlights.length > 0 && (
                <div className="relative z-[1] -mt-8 grid grid-cols-3 gap-3 px-6 sm:-mt-10 sm:gap-4 sm:px-10">
                    {highlights.map((article) => (
                        <div
                            key={article.id}
                            className="overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg transition-transform duration-300 hover:-translate-y-1"
                        >
                            <div className="relative h-24 sm:h-32">
                                {article.imageUrls[0] ? (
                                    <ImageWithSkeleton
                                        src={article.imageUrls[0]}
                                        alt={article.nom}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
                                        <ShoppingBag className="h-6 w-6" />
                                    </div>
                                )}
                                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-2.5 sm:p-4">
                                    <p className="text-xs font-semibold text-white sm:text-base">{article.categorieNom}</p>
                                    <button
                                        onClick={() => onSelectCategory(article.categorieNom)}
                                        className="mt-1.5 w-fit rounded-none bg-[#6b4226]/90 px-2.5 py-1 text-[10px] font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-[#54331d] sm:mt-2 sm:px-4 sm:py-1.5 sm:text-xs"
                                    >
                                        Acheter
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}