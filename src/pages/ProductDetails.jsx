import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  Zap,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  Heart,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

import { subscribeToProducts } from "../services/productService";

const ProductDetails = ({ onAdd }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [wishlist, setWishlist] = useState(false);

  // Load product
  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (products) => {
        const foundProduct = products.find((item) => item.id === id);

        setProduct(foundProduct || null);

        if (foundProduct?.enableSizes && foundProduct.sizes?.length) {
          setSelectedSize((current) => {
            if (
              current &&
              foundProduct.sizes.some((size) => size.id === current.id)
            ) {
              return foundProduct.sizes.find(
                (size) => size.id === current.id
              );
            }

            return foundProduct.sizes[0];
          });
        } else {
          setSelectedSize(null);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Product loading error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe?.();
  }, [id]);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF5F2]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#E8C5C9] border-t-[#762F43] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#762F43] text-sm">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF5F2] px-6">
        <ImageIcon size={48} className="text-[#C9A4A8] mb-4" />

        <h2 className="text-3xl font-serif text-[#762F43]">
          Product Not Found
        </h2>

        <p className="text-[#8C7778] mt-2 text-center">
          This product may have been removed or is unavailable.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-[#762F43] text-white px-7 py-3 rounded-full"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Images
  const images =
    product.images?.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  // Check whether product has size options
  const hasSizes =
    product.enableSizes === true &&
    Array.isArray(product.sizes) &&
    product.sizes.length > 0;

  // Selected size pricing
  const currentPrice = hasSizes
    ? Number(selectedSize?.price || 0)
    : Number(product.price || 0);

  const currentOriginalPrice = hasSizes
    ? Number(selectedSize?.originalPrice || currentPrice)
    : Number(product.originalPrice || currentPrice);

  // Selected size stock
  const currentStock = hasSizes
    ? Number(selectedSize?.stock || 0)
    : product.stock === undefined
      ? Infinity
      : Number(product.stock);

  // Availability
  const isAvailable =
    product.available !== false &&
    currentStock > 0 &&
    (!hasSizes || Boolean(selectedSize));

  // Discount
  const discount =
    currentOriginalPrice > currentPrice
      ? Math.round(
          ((currentOriginalPrice - currentPrice) /
            currentOriginalPrice) *
            100
        )
      : 0;

  // Image navigation
  const changeImage = (direction) => {
    if (!images.length) return;

    setSelectedImage((current) =>
      direction === "next"
        ? (current + 1) % images.length
        : (current - 1 + images.length) % images.length
    );
  };

  // Select size
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  // Add to cart
  const handleAddToCart = (goToCheckout = false) => {
    if (!isAvailable || !onAdd) return;

    const cartProduct = {
      ...product,

      // Different sizes become separate cart items
      cartItemId: hasSizes
        ? `${product.id}_${selectedSize.id}`
        : product.id,

      // Selected size pricing
      price: currentPrice,
      originalPrice: currentOriginalPrice,

      // Selected dimensions
      selectedSize: hasSizes
        ? {
            id: selectedSize.id,
            name: selectedSize.name,
            width: selectedSize.width,
            height: selectedSize.height,
            unit: selectedSize.unit,
          }
        : null,

      image: images[0] || product.image,
      quantity,
    };

    onAdd(cartProduct);

    if (goToCheckout) {
      navigate("/checkout");
    }
  };

  return (
    <main className="bg-[#FAF5F2] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#762F43] text-sm font-medium mb-8 hover:gap-3 transition-all"
        >
          <ArrowLeft size={17} />
          Back to Shopping
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* IMAGE GALLERY */}
          <section>
            <div className="relative bg-[#F0E5E2] rounded-3xl overflow-hidden aspect-square">

              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon
                    size={60}
                    className="text-[#C9A4A8]"
                  />
                </div>
              )}

              {discount > 0 && (
                <span className="absolute top-5 left-5 bg-black text-white text-xs font-bold px-4 py-2 rounded-full">
                  {discount}% OFF
                </span>
              )}

              {/* Wishlist */}
              <button
                onClick={() => setWishlist(!wishlist)}
                className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-md"
                aria-label="Toggle wishlist"
              >
                <Heart
                  size={20}
                  className={
                    wishlist
                      ? "fill-[#762F43] text-[#762F43]"
                      : "text-[#762F43]"
                  }
                />
              </button>

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => changeImage("previous")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={21} />
                  </button>

                  <button
                    onClick={() => changeImage("next")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow"
                    aria-label="Next image"
                  >
                    <ChevronRight size={21} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-[#762F43]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* PRODUCT INFORMATION */}
          <section className="flex flex-col pt-2">

            <p className="text-xs tracking-[0.25em] uppercase text-[#A66D78] font-semibold">
              {product.category || "CRAFTIVA COLLECTION"}
            </p>

            <h1 className="font-serif text-4xl sm:text-5xl text-[#762F43] mt-4 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <span className="text-3xl font-bold text-[#762F43]">
                ₹{currentPrice.toLocaleString("en-IN")}
              </span>

              {currentOriginalPrice > currentPrice && (
                <>
                  <span className="text-lg text-[#A99596] line-through">
                    ₹{currentOriginalPrice.toLocaleString("en-IN")}
                  </span>

                  <span className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-full">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-[#927F80] mt-3">
              Taxes included. Shipping calculated at checkout.
            </p>

            <div className="w-full h-px bg-[#E9D8D6] my-7" />

            {/* SIZE OPTIONS */}
            {hasSizes && (
              <div className="mb-7">

                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-[#762F43]">
                    <span className="font-semibold">Option:</span>{" "}
                    {selectedSize?.name}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">

                  {product.sizes.map((size) => {
                    const active = selectedSize?.id === size.id;

                    const sizeAvailable =
                      product.available !== false &&
                      Number(size.stock) > 0;

                    return (
                      <button
                        key={size.id}
                        type="button"
                        disabled={!sizeAvailable}
                        onClick={() => handleSizeSelect(size)}
                        className={`min-h-[58px] px-7 py-4 rounded-full border-2 text-sm font-semibold transition-all ${
                          active
                            ? "bg-[#762F43] border-[#762F43] text-white"
                            : "bg-white border-[#762F43] text-[#762F43] hover:bg-[#F0E5E2]"
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {size.name} {size.width} × {size.height}
                        {size.unit === "in"
                          ? '"'
                          : ` ${size.unit}`}
                        {!sizeAvailable && " (Sold out)"}
                      </button>
                    );
                  })}

                </div>

                <p className="mt-3 text-xs text-[#927F80]">
                  Select your preferred product size.
                </p>

                {selectedSize && (
                  <div className="mt-4 rounded-xl bg-white border border-[#E9D8D6] p-4">
                    <p className="text-xs text-[#927F80]">
                      Selected dimensions
                    </p>

                    <p className="mt-1 font-semibold text-[#762F43]">
                      {selectedSize.width} × {selectedSize.height}{" "}
                      {selectedSize.unit}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-[#762F43] uppercase tracking-wider mb-3">
                Product Description
              </h3>

              <p className="text-[#806F70] leading-7 text-sm whitespace-pre-line">
                {product.description ||
                  "A beautiful addition to your collection. Crafted with care and designed to make every moment special."}
              </p>
            </div>

            {/* Availability */}
            <div className="mt-7">
              {isAvailable ? (
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full" />
                  In Stock

                  {Number.isFinite(currentStock) && (
                    <span className="text-xs text-gray-500">
                      ({currentStock} available)
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  Currently Out of Stock
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-7">
              <p className="text-sm font-semibold text-[#762F43] mb-3">
                Quantity
              </p>

              <div className="flex items-center border-2 border-[#DFC6C5] rounded-2xl w-fit overflow-hidden">

                <button
                  onClick={() =>
                    setQuantity((q) => Math.max(1, q - 1))
                  }
                  className="w-14 h-12 flex items-center justify-center text-[#762F43] hover:bg-[#F0E5E2]"
                  aria-label="Decrease quantity"
                >
                  <Minus size={17} />
                </button>

                <span className="w-12 text-center font-semibold text-[#762F43]">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(currentStock, q + 1)
                    )
                  }
                  disabled={quantity >= currentStock}
                  className="w-14 h-12 flex items-center justify-center text-[#762F43] hover:bg-[#F0E5E2] disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus size={17} />
                </button>

              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-7 grid grid-cols-3 gap-3">

              <div className="rounded-2xl border border-[#E9D8D6] bg-white p-4 text-center">
                <Truck
                  size={23}
                  className="mx-auto text-[#D47C99]"
                />
                <p className="mt-2 text-xs text-[#806F70]">
                  Shipping available
                </p>
              </div>

              <div className="rounded-2xl border border-[#E9D8D6] bg-white p-4 text-center">
                <ShieldCheck
                  size={23}
                  className="mx-auto text-[#D47C99]"
                />
                <p className="mt-2 text-xs text-[#806F70]">
                  Safe packaging
                </p>
              </div>

              <div className="rounded-2xl border border-[#E9D8D6] bg-white p-4 text-center">
                <CheckCircle2
                  size={23}
                  className="mx-auto text-[#D47C99]"
                />
                <p className="mt-2 text-xs text-[#806F70]">
                  Prepaid orders
                </p>
              </div>

            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">

              <button
                onClick={() => handleAddToCart(false)}
                disabled={!isAvailable}
                className="flex items-center justify-center gap-2 bg-[#762F43] text-white py-4 rounded-full font-semibold hover:bg-[#5E2334] disabled:opacity-50"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>

              <button
                onClick={() => handleAddToCart(true)}
                disabled={!isAvailable}
                className="flex items-center justify-center gap-2 border-2 border-[#762F43] text-[#762F43] py-4 rounded-full font-semibold hover:bg-[#F0E5E2] disabled:opacity-50"
              >
                <Zap size={18} />
                Order Now
              </button>

            </div>

          </section>
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;