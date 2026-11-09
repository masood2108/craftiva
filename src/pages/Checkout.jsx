import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Upload, Image as ImageIcon, X, CheckCircle2 } from "lucide-react";

import { auth } from "../firebase";
import { createOrder } from "../services/orderService";
import { uploadImage } from "../services/cloudinaryService";

export default function Checkout({ cart, onOrderPlaced }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [details, setDetails] = useState({
    name: "",
    phone: "",
    email: auth.currentUser?.email || "",
    address: "",
  });

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDetails((old) => ({
      ...old,
      [name]: value,
    }));
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Upload JPG, PNG or WEBP image only");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Screenshot must be smaller than 5 MB");
      e.target.value = "";
      return;
    }

    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
    }

    setPaymentScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const removeScreenshot = () => {
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
    }

    setPaymentScreenshot(null);
    setScreenshotPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!cart.length) {
      toast.error("Your shopping bag is empty");
      return;
    }

    if (!auth.currentUser) {
      toast.error("Please sign in before placing your order");
      navigate("/login");
      return;
    }

    if (!details.name.trim()) {
      toast.error("Enter your full name");
      return;
    }

    if (!/^[0-9]{10}$/.test(details.phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    if (!details.email.trim()) {
      toast.error("Enter your email address");
      return;
    }

    if (!details.address.trim()) {
      toast.error("Enter your delivery address");
      return;
    }

    if (!paymentScreenshot) {
      toast.error("Upload your UPI payment screenshot");
      return;
    }

    setLoading(true);

    try {
      toast.loading("Uploading payment screenshot...", {
        id: "payment-upload",
      });

      const paymentScreenshotUrl = await uploadImage(
        paymentScreenshot
      );

      toast.dismiss("payment-upload");

      const orderItems = cart.map((item) => ({
        id: item.id,
        cartItemId: item.cartItemId || item.id,
        name: item.name,
        image: item.image || item.images?.[0] || "",
        price: Number(item.price),
        originalPrice: Number(item.originalPrice || item.price),
        quantity: Number(item.quantity),

        selectedSize: item.selectedSize
          ? {
              id: item.selectedSize.id,
              name: item.selectedSize.name,
              width: Number(item.selectedSize.width),
              height: Number(item.selectedSize.height),
              unit: item.selectedSize.unit || "mm",
            }
          : null,

        subtotal:
          Number(item.price) * Number(item.quantity),
      }));

      const orderData = {
        userId: auth.currentUser.uid,
        customerName: details.name.trim(),
        phone: details.phone,
        email: details.email.trim(),
        address: details.address.trim(),
        items: orderItems,
        total,
        paymentMethod: "UPI",
        paymentReference: transactionId.trim(),
        paymentScreenshot: paymentScreenshotUrl,
        paymentStatus: "Pending Verification",
        status: "Pending",
      };

      const orderId = await createOrder(orderData);

      // Clear cart only after Firestore confirms order creation
      if (onOrderPlaced) {
        onOrderPlaced();
      }

      toast.success("Order placed successfully!");

navigate(`/order-success/${orderId}`, {
  state: {
    order: {
      ...orderData,
      orderId,
    },
  },
});    } catch (error) {
      console.error("Order creation failed:", error);

      toast.dismiss("payment-upload");

      toast.error(
        error.message || "Unable to place your order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF5F2] px-4 py-16">
      <div className="container-shell">

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A66D78]">
          Almost yours
        </p>

        <h1 className="display-font mt-3 text-5xl text-[#762F43]">
          Checkout
        </h1>

        <div className="mt-12 grid gap-12 md:grid-cols-[1fr_380px]">

          <form onSubmit={handleSubmit} className="space-y-5">

            <h2 className="display-font mb-5 text-3xl text-[#762F43]">
              Delivery details
            </h2>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#762F43]">
                Full name *
              </label>

              <input
                required
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={details.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#DFC6C5] bg-white px-4 py-4 text-sm outline-none focus:border-[#762F43]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#762F43]">
                Phone number *
              </label>

              <input
                required
                name="phone"
                type="tel"
                maxLength="10"
                placeholder="10-digit mobile number"
                value={details.phone}
                onChange={(e) =>
                  setDetails((old) => ({
                    ...old,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
                className="w-full rounded-xl border border-[#DFC6C5] bg-white px-4 py-4 text-sm outline-none focus:border-[#762F43]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#762F43]">
                Email address *
              </label>

              <input
                required
                name="email"
                type="email"
                placeholder="Enter your email"
                value={details.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#DFC6C5] bg-white px-4 py-4 text-sm outline-none focus:border-[#762F43]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#762F43]">
                Full delivery address *
              </label>

              <textarea
                required
                name="address"
                rows="5"
                placeholder="House number, street, city, state and PIN code"
                value={details.address}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-[#DFC6C5] bg-white px-4 py-4 text-sm outline-none focus:border-[#762F43]"
              />
            </div>

            {/* PAYMENT SECTION */}
            <div className="rounded-2xl border border-[#E9D8D6] bg-white p-5 sm:p-6">

              <h3 className="text-lg font-semibold text-[#762F43]">
                Payment method
              </h3>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#762F43]">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#762F43]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#762F43]">
                    UPI Payment
                  </p>

                  <p className="mt-1 text-xs text-[#927F80]">
                    Prepaid orders only. Cash on delivery unavailable.
                  </p>
                </div>
              </div>

              {/* QR CODE */}
              <div className="mt-6 rounded-xl border border-[#E9D8D6] bg-[#FAF5F2] p-5 text-center">

                <p className="text-sm font-semibold text-[#762F43]">
                  Scan & Pay
                </p>

                <p className="mt-1 text-xs text-[#927F80]">
                  Scan QR code using PhonePe, Google Pay or any UPI app.
                </p>

                <div className="mx-auto mt-5 w-fit rounded-xl border border-[#E9D8D6] bg-white p-3">
                  <img
                    src="/images/phonepe-qr.png"
                    alt="CRAFTIVA PhonePe Payment QR"
                    className="h-64 w-64 object-contain"
                  />
                </div>

                <div className="mt-5 rounded-lg bg-white p-4">
                  <p className="text-xs text-[#927F80]">
                    Amount to pay
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#762F43]">
                    ₹{formatPrice(total)}
                  </p>
                </div>

                <p className="mt-4 text-xs leading-5 text-[#927F80]">
                  Complete your payment first. Then upload payment
                  screenshot below. Your order will be confirmed
                  after admin verifies payment.
                </p>
              </div>

              {/* TRANSACTION ID */}
              <div className="mt-6">
                <label className="mb-2 block text-xs font-semibold text-[#762F43]">
                  UPI Transaction ID (Optional)
                </label>

                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter UPI transaction ID"
                  className="w-full rounded-xl border border-[#DFC6C5] bg-white px-4 py-4 text-sm outline-none focus:border-[#762F43]"
                />
              </div>

              {/* SCREENSHOT UPLOAD */}
              <div className="mt-6">

                <label className="mb-2 block text-xs font-semibold text-[#762F43]">
                  Payment screenshot *
                </label>

                {!screenshotPreview ? (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#DFC6C5] bg-[#FAF5F2] px-5 py-9 text-center transition hover:border-[#762F43]">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0E5E2]">
                      <Upload className="h-5 w-5 text-[#762F43]" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-[#762F43]">
                      Upload payment screenshot
                    </p>

                    <p className="mt-1 text-xs text-[#927F80]">
                      PNG, JPG or WEBP · Maximum 5 MB
                    </p>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-xl border border-[#DFC6C5] bg-[#FAF5F2] p-3">

                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot preview"
                      className="mx-auto max-h-64 rounded-lg object-contain"
                    />

                    <div className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Screenshot selected
                    </div>

                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow"
                      aria-label="Remove screenshot"
                    >
                      <X className="h-4 w-4" />
                    </button>

                  </div>
                )}

              </div>

              <div className="mt-5 flex items-start gap-2 rounded-lg bg-[#FAF5F2] p-3">
                <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#A66D78]" />

                <p className="text-xs leading-5 text-[#927F80]">
                  Upload a clear screenshot showing your successful
                  payment. Orders without payment proof cannot be
                  submitted.
                </p>
              </div>

            </div>

            {!auth.currentUser && (
              <p className="text-xs text-red-600">
                Please{" "}
                <Link to="/login" className="underline">
                  sign in
                </Link>{" "}
                before placing your order.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !cart.length}
              className="w-full rounded-full bg-[#762F43] py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#5E2334] disabled:opacity-50"
            >
              {loading
                ? "Uploading & placing order..."
                : "Place order"}
            </button>

            <Link
              to="/cart"
              className="block text-center text-xs text-[#762F43] underline underline-offset-4"
            >
              Back to shopping bag
            </Link>

          </form>

          {/* ORDER SUMMARY */}
          <aside className="h-fit rounded-2xl bg-[#F0E5E2] p-6 md:p-7">

            <h2 className="display-font text-3xl text-[#762F43]">
              Your order
            </h2>

            <div className="mt-6 space-y-5">

              {cart.map((item) => (
                <div
                  key={item.cartItemId || item.id}
                  className="flex gap-4 border-b border-[#DFC6C5] pb-5"
                >

                  <img
                    src={item.image || item.images?.[0]}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl bg-white object-cover"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-[#762F43]">
                      {item.name}
                    </p>

                    {item.selectedSize && (
                      <div className="mt-2">
                        <p className="text-xs text-[#806F70]">
                          Size: {item.selectedSize.name}
                        </p>

                        <p className="text-xs text-[#806F70]">
                          Dimensions: {item.selectedSize.width} ×{" "}
                          {item.selectedSize.height}{" "}
                          {item.selectedSize.unit || "mm"}
                        </p>
                      </div>
                    )}

                    <p className="mt-2 text-xs text-[#927F80]">
                      ₹{formatPrice(item.price)} × {item.quantity}
                    </p>

                  </div>

                  <p className="shrink-0 text-sm font-semibold text-[#762F43]">
                    ₹
                    {formatPrice(
                      Number(item.price) * Number(item.quantity)
                    )}
                  </p>

                </div>
              ))}

            </div>

            <div className="mt-6 flex justify-between text-sm">
              <span className="text-[#806F70]">
                Subtotal
              </span>

              <span className="text-[#762F43]">
                ₹{formatPrice(total)}
              </span>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-[#806F70]">
                Shipping
              </span>

              <span className="text-[#762F43]">
                Calculated separately
              </span>
            </div>

            <div className="mt-5 flex justify-between border-t border-[#DFC6C5] pt-5 font-bold text-[#762F43]">
              <span>Total payable</span>

              <span className="text-lg">
                ₹{formatPrice(total)}
              </span>
            </div>

            <p className="mt-5 text-xs leading-6 text-[#806F70]">
              Your selected product sizes, dimensions and prices
              will be included in your order.
            </p>

          </aside>

        </div>
      </div>
    </main>
  );
}