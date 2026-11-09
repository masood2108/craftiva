import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProductCard({ product, onAdd }) {
  const [activeImage, setActiveImage] = useState(0);
  const navigate = useNavigate();

  const images =
    product.images?.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const currentImage = images[activeImage] || "";

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || price;

  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const unavailable =
    product.available === false ||
    (product.stock !== undefined && Number(product.stock) <= 0);

  const formatPrice = (amount) =>
    `₹${amount.toLocaleString("en-IN")}`;

  const previousImage = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setActiveImage((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setActiveImage((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleAddToCart = () => {
    if (unavailable) return;

    if (!onAdd) {
      toast.error("Unable to add product to cart.");
      return;
    }

    onAdd(product);
  };

  const handleOrderNow = () => {
    if (unavailable) return;

    if (!onAdd) {
      toast.error("Unable to process your order.");
      return;
    }

    onAdd(product);
    navigate("/checkout");
  };

  return (
    <article className="group min-w-0">

      {/* IMAGE */}
      <div className="relative overflow-hidden rounded-xl bg-[#F3E7EA]">

        <Link
          to={`/product/${product.id}`}
          className="relative block aspect-[4/5] overflow-hidden"
        >
          {currentImage ? (
            <img
              src={currentImage}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-[#B58A98]">
              <ImageIcon size={40} />
              <span className="text-xs font-medium">
                Product image
              </span>
            </div>
          )}
        </Link>

        {/* SALE BADGE */}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-[#93475F] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
            {discount}% OFF
          </span>
        )}

        {/* IMAGE NAVIGATION */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous product image"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#93475F] shadow-md hover:bg-[#93475F] hover:text-white"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Next product image"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#93475F] shadow-md hover:bg-[#93475F] hover:text-white"
            >
              <ChevronRight size={17} />
            </button>

            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveImage(index);
                  }}
                  aria-label={`View image ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImage === index
                      ? "w-5 bg-[#93475F]"
                      : "w-1.5 bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* STOCK STATUS */}
        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <span className="rounded-full bg-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-[#93475F]">
              Out of Stock
            </span>
          </div>
        )}

        {/* QUICK VIEW */}
        <Link
          to={`/product/${product.id}`}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#93475F] opacity-0 shadow-lg transition group-hover:opacity-100"
          aria-label="View product"
        >
          <ArrowUpRight size={19} />
        </Link>
      </div>

      {/* DETAILS */}
      <div className="pt-4">

        <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-[#A65370]">
          {product.subcategory || product.category || "CRAFTIVA"}
        </p>

        <div className="mt-1 flex items-start justify-between gap-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#49343D] transition hover:text-[#93475F]">
              {product.name}
            </h3>
          </Link>

          <Link
            to={`/product/${product.id}`}
            aria-label="View product"
            className="shrink-0 text-[#93475F]"
          >
            <ArrowUpRight size={17} />
          </Link>
        </div>

        {/* PRICE */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-[#93475F]">
            {formatPrice(price)}
          </span>

          {discount > 0 && (
            <>
              <span className="text-xs text-[#AA969D] line-through">
                {formatPrice(originalPrice)}
              </span>

              <span className="text-[9px] font-bold text-green-700">
                Save {discount}%
              </span>
            </>
          )}
        </div>

        {/* ADD TO CART */}
        <button
          type="button"
          disabled={unavailable}
          onClick={handleAddToCart}
          className="mt-4 flex w-full items-center justify-center gap-2 border border-[#93475F] px-3 py-3 text-[9px] font-bold uppercase tracking-[0.13em] text-[#93475F] transition hover:bg-[#93475F] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingBag size={14} />
          {unavailable ? "Unavailable" : "Add to Cart"}
        </button>

        {/* ORDER NOW */}
        <button
          type="button"
          disabled={unavailable}
          onClick={handleOrderNow}
          className="mt-2 flex w-full items-center justify-center gap-2 bg-[#93475F] px-3 py-3 text-[9px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#713449] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Zap size={14} />
          Order Now
        </button>
      </div>
    </article>
  );
}