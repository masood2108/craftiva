import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Truck,
  ShieldCheck,
  Star,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";

import { subscribeToProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";

const IMAGES = {
  hero: "https://beamish-concha-6c7ed1.netlify.app/img/hero-wall.png",
  supra: "https://beamish-concha-6c7ed1.netlify.app/img/supra.jpg",
  poster: "https://beamish-concha-6c7ed1.netlify.app/img/fight-club.png",
  volkswagen: "https://beamish-concha-6c7ed1.netlify.app/img/volkswagen.jpg",
};

const specialties = [
  {
    id: "frames",
    label: "FRAME COLLECTION",
    title: "Custom Frames",
    description: "Real diecast cars mounted in 3D, framed to last forever.",
    button: "Shop Frames",
    image: IMAGES.supra,
    filter: "frames",
  },
  {
    id: "posters",
    label: "HD PRINTING",
    title: "Custom Posters",
    description: "300 GSM matte prints in A4 & A3 from 2,000+ designs.",
    button: "Explore Posters",
    image: IMAGES.poster,
    filter: "posters",
  },
  {
    id: "gifts",
    label: "HANDMADE GIFTS",
    title: "Custom Gift",
    description: "Personalised frames & photo gifts for birthdays and anniversaries.",
    button: "Make a Gift",
    image: IMAGES.volkswagen,
    filter: "frames",
  },
  {
    id: "offer",
    label: "LIVE OFFER",
    title: "Up to 33% OFF",
    description: "Sale prices live on all 3D frames & posters. Limited stock!",
    button: "Grab Offer",
    image: IMAGES.hero,
    filter: "sale",
  },
];

const filters = [
  { id: "all", label: "All" },
  { id: "frames", label: "3D Frames" },
  { id: "posters", label: "Posters" },
  { id: "sale", label: "On Sale" },
  { id: "stock", label: "In Stock" },
];

const reviews = [
  {
    text: "The Supra frame looks even better in person. Packed so safely! My brother loved his birthday gift.",
    name: "Aditi S.",
    city: "Raipur",
  },
  {
    text: "Ordered the F1 Ferrari frame — insane quality and the car model is real metal. Delivered in 3 days.",
    name: "Rohan V.",
    city: "Bhilai",
  },
  {
    text: "Did my whole wall with their posters. Colours are super crisp and the team helped me pick the layout on WhatsApp.",
    name: "Sneha P.",
    city: "Bilaspur",
  },
  {
    text: "Pan India delivery is legit. The Volkswagen frame is the centre of my study table now.",
    name: "Karan M.",
    city: "Pune",
  },
];

function getProductCategory(product) {
  return `${product.category || ""} ${product.subcategory || ""}`.toLowerCase();
}

export default function Home({ onAdd }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [wishlist, setWishlist] = useState([]);

  const location = useLocation();

  // Handle direct navigation from hamburger menu.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");

    const validCategories = ["all", "frames", "posters", "sale", "stock"];

    if (validCategories.includes(category)) {
      setActiveFilter(category);

      requestAnimationFrame(() => {
        document.getElementById("bestsellers")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } else if (location.hash === "#bestsellers") {
      document.getElementById("bestsellers")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [location.search, location.hash]);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Products loading error:", err);
        setError("Unable to load products. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const availableProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.available !== false &&
          Number(product.stock ?? 1) > 0
      ),
    [products]
  );

  const filteredProducts = useMemo(() => {
    switch (activeFilter) {
      case "frames":
        return availableProducts.filter((product) => {
          const category = getProductCategory(product);
          return category.includes("frame") || category.includes("3d");
        });

      case "posters":
        return availableProducts.filter((product) => {
          const category = getProductCategory(product);
          return category.includes("poster") || category.includes("wall art");
        });

      case "sale":
        return availableProducts.filter(
          (product) =>
            Number(product.originalPrice) > Number(product.price)
        );

      case "stock":
        return availableProducts.filter(
          (product) => Number(product.stock ?? 0) > 0
        );

      default:
        return availableProducts;
    }
  }, [availableProducts, activeFilter]);

  const scrollToProducts = (filter = "all") => {
    setActiveFilter(filter);

    document.getElementById("bestsellers")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const toggleWishlist = (id) => {
    setWishlist((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  return (
    <main className="overflow-hidden bg-[#FFF9F7] text-[#302326]">

      {/* ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-[#E98DB5] via-[#ECA1C4] to-[#DE83A9] px-4 py-2.5 text-center text-[10px] font-bold tracking-[0.12em] text-white sm:text-xs">
        Raipur Chhattisgarh OG NO.1 Custom Poster & Frames Seller ✨
      </div>

      {/* HERO */}
      <section className="relative flex min-h-[570px] items-center overflow-hidden bg-[#39232A] sm:min-h-[620px] lg:min-h-[650px]">
        <img
          src={IMAGES.hero}
          alt="CRAFTIVA framed artwork wall"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#211519]/85 via-[#29191E]/65 to-[#391E28]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#4A202D]/80 via-transparent to-black/10" />

        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-20 md:px-12 lg:px-20">
          <div className="max-w-[850px]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E98DB5] px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-white">
              <Star size={13} fill="white" />
              RAIPUR CHHATTISGARH OG NO.1
            </div>

            <h1 className="display-font mt-7 text-5xl font-bold leading-[1.02] text-white sm:text-6xl md:text-7xl lg:text-[76px]">
              4,000+ Happy Customers
              <br />
              & Walls Done.
              <br />
              <span className="italic text-[#F5A4CD]">Yours Next.</span>
            </h1>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => scrollToProducts("all")}
                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#EA8DB4] to-[#B84D73] px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1"
              >
                Shop Now
                <ArrowRight size={17} />
              </button>

              <button
                onClick={() =>
                  document.getElementById("wall-packs")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="rounded-full border-2 border-white/80 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#713449]"
              >
                Build Your Wall
              </button>
            </div>

            <div className="mt-7 grid max-w-[650px] grid-cols-3 border-t border-white/30 pt-5">
              <div>
                <p className="text-xl font-extrabold text-white sm:text-2xl">4.9★</p>
                <p className="mt-1 text-xs text-white/80">43,000+ reviews</p>
              </div>

              <div className="border-l border-white/30 pl-5">
                <p className="text-xl font-extrabold text-white sm:text-2xl">2,000+</p>
                <p className="mt-1 text-xs text-white/80">Poster designs</p>
              </div>

              <div className="border-l border-white/30 pl-5">
                <p className="text-xl font-extrabold text-white sm:text-2xl">Pan India</p>
                <p className="mt-1 text-xs text-white/80">Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section
        id="specialties"
        className="mx-auto max-w-[1400px] px-6 py-14 md:px-12 lg:px-20"
      >
        <h2 className="display-font text-4xl font-bold text-[#302326] sm:text-5xl">
          Explore Our Specialties
        </h2>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {specialties.map((item) => (
            <article
              key={item.id}
              className="group relative h-[430px] overflow-hidden rounded-[22px] bg-[#EADDE0] shadow-sm"
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#21171B]/95 via-[#21171B]/10 to-transparent" />

              <div className="absolute left-5 top-5">
                <span
                  className={`rounded-full px-3 py-2 text-[9px] font-extrabold uppercase tracking-widest text-white ${
                    item.id === "offer"
                      ? "bg-[#E94F83]"
                      : "bg-white/20 backdrop-blur-md"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              <div className="absolute inset-x-5 bottom-5 text-white">
                <h3 className="display-font text-3xl font-bold sm:text-[34px]">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/90">
                  {item.description}
                </p>

                <button
                  onClick={() => scrollToProducts(item.filter)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-[#93475F] transition hover:bg-[#F7DDE8]"
                >
                  {item.button}
                  <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section
        id="bestsellers"
        className="mx-auto max-w-[1400px] scroll-mt-24 px-6 py-12 md:px-12 lg:px-20"
      >
        {/* Both menu destinations point to this existing product section.
            The URL category determines which products are displayed. */}
        <div id="posters" />
        <div id="frames" />

        <div className="flex items-center justify-between gap-4">
          <h2 className="display-font text-4xl font-bold text-[#302326] sm:text-5xl">
            {activeFilter === "posters"
              ? "Shop All Posters"
              : activeFilter === "frames"
              ? "3D Car & Figure Frames"
              : "Shop Bestsellers"}
          </h2>

          <span className="text-sm text-[#827579]">
            {filteredProducts.length} items
          </span>
        </div>

        {/* FILTERS */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-xs font-semibold transition ${
                activeFilter === filter.id
                  ? "border-[#302326] bg-[#302326] text-white"
                  : "border-[#E8DDE0] bg-white text-[#493B3F] hover:border-[#A34E68]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="aspect-[4/5] rounded-2xl bg-[#F0E7E9]" />
                <div className="mt-4 h-4 w-3/4 rounded bg-[#F0E7E9]" />
                <div className="mt-3 h-4 w-1/2 rounded bg-[#F0E7E9]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl bg-white p-10 text-center text-sm text-red-600">
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-[#E8D5DC] bg-white px-6 py-16 text-center">
            <ShoppingBag size={35} className="mx-auto text-[#B86B85]" />
            <h3 className="display-font mt-4 text-3xl text-[#512D3B]">
              No products match.
            </h3>
            <p className="mt-2 text-sm text-[#947F86]">
              Try another search or filter.
            </p>
            <button
              onClick={() => setActiveFilter("all")}
              className="mt-5 rounded-full bg-[#93475F] px-6 py-3 text-xs font-bold text-white"
            >
              View All
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="relative min-w-0">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                  className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md"
                >
                  <Heart
                    size={17}
                    className={
                      wishlist.includes(product.id)
                        ? "fill-[#A65370] text-[#A65370]"
                        : "text-[#93475F]"
                    }
                  />
                </button>

                <ProductCard product={product} onAdd={onAdd} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* WALL SETUP PACKS */}
      <section
        id="wall-packs"
        className="mx-auto max-w-[1400px] px-6 py-12 md:px-12 lg:px-20"
      >
        <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#F8DCE8] via-[#F9E7EF] to-[#F4C8E7] px-7 py-12 sm:px-12 lg:px-14 lg:py-16">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/20" />

          <div className="relative max-w-2xl">
            <span className="rounded-full bg-[#302326] px-4 py-2 text-[9px] font-extrabold uppercase tracking-widest text-white">
              RECOMMENDED
            </span>

            <h2 className="display-font mt-6 text-4xl font-bold text-[#302326] sm:text-5xl">
              Wall Setup Packs
            </h2>

            <p className="mt-3 max-w-xl text-base leading-7 text-[#79666D]">
              Curated sets of 10–30 posters that make any room look done in an afternoon. Or build your own from 2,000+ designs.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => scrollToProducts("posters")}
                className="rounded-full bg-gradient-to-r from-[#E98DB5] to-[#A94E70] px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1"
              >
                View Packs
              </button>

              <a
                href="https://wa.me/919770633408?text=Hi%20CRAFTIVA%2C%20I%20want%20to%20build%20my%20own%20wall%20setup."
                target="_blank"
                rel="noreferrer"
                className="rounded-full border-2 border-[#E8799F] bg-white px-7 py-4 text-sm font-bold text-[#A34E68]"
              >
                Build Your Own
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-[1400px] px-6 py-12 md:px-12 lg:px-20">
        <div className="mb-7 flex items-center justify-between gap-4">
          <h2 className="display-font text-4xl font-bold text-[#302326] sm:text-5xl">
            Loved Across India
          </h2>

          <span className="shrink-0 rounded-full bg-[#302326] px-4 py-2 text-xs font-bold text-white">
            4.9 ★ <span className="font-normal">43,000+</span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <article
              key={review.name + review.city}
              className="flex min-h-[220px] flex-col rounded-2xl bg-white p-5 shadow-[0_8px_25px_rgba(73,42,52,0.06)]"
            >
              <div className="flex gap-1 text-[#F5A623]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} fill="currentColor" strokeWidth={0} />
                ))}
              </div>

              <p className="mt-4 flex-1 text-sm leading-6 text-[#493B3F]">
                {review.text}
              </p>

              <p className="mt-5 text-sm text-[#88777C]">
                <strong className="text-[#59464C]">{review.name}</strong>
                {" · "}
                {review.city}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* SERVICE BENEFITS */}
      <section className="mx-auto max-w-[1400px] px-6 pb-14 md:px-12 lg:px-20">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Truck,
              title: "Pan India Delivery",
              text: "Bubble-wrapped doorstep shipping",
            },
            {
              icon: ShieldCheck,
              title: "Damage Protection",
              text: "Free replacement if it arrives broken",
            },
            {
              icon: IndianRupee,
              title: "UPI Payments",
              text: "Secure prepaid ordering",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-2xl border border-[#F0DCE3] bg-white px-5 py-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F9DCE7] text-[#A34E68]">
                  <Icon size={23} />
                </span>

                <div>
                  <h3 className="text-sm font-extrabold text-[#302326]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#88777C]">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}