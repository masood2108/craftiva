import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function Cart({ cart, onUpdate, onRemove }) {
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  const getCartKey = (item) =>
    item.cartItemId || item.id;

  const getSizeLabel = (item) => {
    if (!item.selectedSize) return null;

    const size = item.selectedSize;

    return `${size.name} ${size.width} × ${size.height} ${size.unit}`;
  };

  return (
    <main className="container-shell min-h-[65vh] py-16 md:py-24">

      <p className="eyebrow text-accent">Your selection</p>

      <h1 className="display-font mt-3 text-5xl text-[#762F43]">
        Shopping bag
      </h1>

      {cart.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBag
            size={42}
            className="mx-auto mb-5 text-[#C9A4A8]"
          />

          <p className="text-sm text-muted">
            Your bag is waiting for something good.
          </p>

          <Link
            to="/"
            className="mt-6 inline-block rounded-full bg-[#762F43] px-7 py-4 text-xs font-bold uppercase tracking-widest text-white"
          >
            Explore collection
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 md:grid-cols-[1fr_330px]">

          {/* Cart Items */}
          <div className="space-y-6">
            {cart.map((item) => {
              const cartKey = getCartKey(item);
              const sizeLabel = getSizeLabel(item);

              return (
                <div
                  key={cartKey}
                  className="flex gap-4 border-b border-[#E9D8D6] pb-6 sm:gap-5"
                >
                  <img
                    src={item.image || item.images?.[0]}
                    alt={item.name}
                    className="h-28 w-24 rounded-xl bg-[#F0E5E2] object-cover"
                  />

                  <div className="flex min-w-0 flex-1 justify-between gap-3">

                    <div className="min-w-0">
                      <p className="font-semibold text-[#762F43]">
                        {item.name}
                      </p>

                      {sizeLabel && (
                        <p className="mt-2 text-xs font-medium text-[#A66D78]">
                          Size: {sizeLabel}
                        </p>
                      )}

                      {!sizeLabel && item.type && (
                        <p className="mt-1 text-xs text-muted">
                          {item.type}
                        </p>
                      )}

                      <p className="mt-2 text-sm text-gray-500">
                        ₹{Number(item.price).toLocaleString("en-IN")} each
                      </p>

                      {/* Quantity */}
                      <div className="mt-5 flex w-fit items-center gap-4 rounded-full border border-[#DFC6C5] px-3 py-2">

                        <button
                          onClick={() =>
                            onUpdate(
                              cartKey,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="text-xs font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            onUpdate(cartKey, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>

                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-[#762F43]">
                        ₹
                        {(
                          Number(item.price) * item.quantity
                        ).toLocaleString("en-IN")}
                      </p>

                      <button
                        onClick={() => onRemove(cartKey)}
                        className="mt-5 text-gray-400 hover:text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <aside className="h-fit rounded-2xl bg-[#F0E5E2] p-7">

            <h2 className="display-font text-3xl text-[#762F43]">
              Order summary
            </h2>

            <div className="mt-7 flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>

              <span>
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-4 flex justify-between border-t border-[#DFC6C5] pt-5 font-semibold text-[#762F43]">
              <span>Total</span>

              <span>
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

            <Link
              to="/checkout"
              className="mt-7 block rounded-full bg-[#762F43] py-4 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-[#5E2334]"
            >
              Continue to checkout
            </Link>

            <p className="mt-4 text-center text-xs text-gray-500">
              Secure prepaid checkout
            </p>

          </aside>
        </div>
      )}
    </main>
  );
}