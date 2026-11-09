import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

import { auth } from "../firebase";
import { subscribeToUserOrders } from "../services/orderService";

const ORDER_STEPS = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
];

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserOrders(
      user.uid,
      (data) => {
        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Unable to load your orders");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN");

  const formatDate = (timestamp) => {
    if (!timestamp) return "Processing";

    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusColor = (status) => {
    const styles = {
      Pending: "bg-amber-100 text-amber-700",
      "Payment Verification": "bg-blue-100 text-blue-700",
      Confirmed: "bg-green-100 text-green-700",
      Shipped: "bg-purple-100 text-purple-700",
      Delivered: "bg-emerald-100 text-emerald-700",
      Cancelled: "bg-red-100 text-red-700",
    };

    return styles[status] || "bg-gray-100 text-gray-600";
  };

  const getPaymentColor = (status) => {
    if (status === "Verified") return "text-green-700 bg-green-100";
    if (status === "Rejected") return "text-red-700 bg-red-100";

    return "text-amber-700 bg-amber-100";
  };

  const getStepIcon = (step, currentStatus) => {
    if (step === "Delivered") return <CheckCircle2 size={16} />;
    if (step === "Shipped") return <Truck size={16} />;
    if (step === "Confirmed") return <CheckCircle2 size={16} />;

    return <Clock size={16} />;
  };

  const getCurrentStep = (status) => {
    if (status === "Pending") return 0;
    if (status === "Payment Verification") return 0;
    if (status === "Confirmed") return 1;
    if (status === "Shipped") return 2;
    if (status === "Delivered") return 3;

    return -1;
  };

  if (!auth.currentUser) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#FAF5F2] px-4">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-[#A66D78]" />

          <h1 className="display-font mt-5 text-4xl text-[#762F43]">
            Sign in to continue
          </h1>

          <p className="mt-3 text-sm text-[#927F80]">
            Sign in to view your orders.
          </p>

          <Link
            to="/login"
            className="mt-7 inline-block rounded-full bg-[#762F43] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF5F2] px-4 py-12 md:px-10">
      <div className="mx-auto max-w-5xl">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#806F70] hover:text-[#762F43]"
        >
          <ArrowLeft size={17} />
          Continue shopping
        </Link>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A66D78]">
            Your CRAFTIVA account
          </p>

          <h1 className="display-font mt-3 text-5xl text-[#762F43]">
            My Orders
          </h1>

          <p className="mt-3 text-sm text-[#927F80]">
            View your purchases and track their delivery status.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 rounded-2xl bg-white p-12 text-center text-sm text-[#927F80]">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[#E9D8D6] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F0E5E2]">
              <ShoppingBag className="h-7 w-7 text-[#762F43]" />
            </div>

            <h2 className="display-font mt-6 text-3xl text-[#762F43]">
              No orders yet
            </h2>

            <p className="mt-3 text-sm text-[#927F80]">
              Your purchases will appear here once you place an order.
            </p>

            <Link
              to="/"
              className="mt-7 inline-block rounded-full bg-[#762F43] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white"
            >
              Explore CRAFTIVA
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-7">

            {orders.map((order) => {
              const currentStep = getCurrentStep(order.status);
              const isCancelled = order.status === "Cancelled";

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-[#E9D8D6] bg-white"
                >

                  {/* ORDER HEADER */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E5E2] p-5 sm:p-6">

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#A66D78]">
                        Order ID
                      </p>

                      <p className="mt-2 break-all text-sm font-semibold text-[#762F43]">
                        {order.id}
                      </p>

                      <p className="mt-2 text-xs text-[#927F80]">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#A66D78]">
                        Order total
                      </p>

                      <p className="mt-2 text-xl font-bold text-[#762F43]">
                        ₹{formatPrice(order.total)}
                      </p>
                    </div>

                  </div>

                  <div className="p-5 sm:p-6">

                    {/* STATUS */}
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status || "Pending"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${getPaymentColor(
                          order.paymentStatus
                        )}`}
                      >
                        Payment: {order.paymentStatus || "Pending Verification"}
                      </span>
                    </div>

                    {/* TRACKING */}
                    {!isCancelled && (
                      <div className="mt-8">
                        <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[#A66D78]">
                          Order progress
                        </p>

                        <div className="grid grid-cols-4 gap-2">
                          {ORDER_STEPS.map((step, index) => {
                            const completed = index <= currentStep;

                            return (
                              <div key={step} className="text-center">
                                <div
                                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${
                                    completed
                                      ? "bg-[#762F43] text-white"
                                      : "bg-[#F0E5E2] text-[#A66D78]"
                                  }`}
                                >
                                  {getStepIcon(step, order.status)}
                                </div>

                                <p
                                  className={`mt-2 text-[10px] font-semibold sm:text-xs ${
                                    completed
                                      ? "text-[#762F43]"
                                      : "text-[#B5A3A3]"
                                  }`}
                                >
                                  {step}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {order.status === "Pending" && (
                          <p className="mt-5 text-xs leading-5 text-[#927F80]">
                            Your order is awaiting payment verification.
                          </p>
                        )}

                        {order.status === "Payment Verification" && (
                          <p className="mt-5 text-xs leading-5 text-[#927F80]">
                            Your payment is being reviewed.
                          </p>
                        )}
                      </div>
                    )}

                    {isCancelled && (
                      <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                        <XCircle size={18} />
                        This order has been cancelled.
                      </div>
                    )}

                    {/* PRODUCTS */}
                    <div className="mt-8 border-t border-[#F0E5E2] pt-6">
                      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#A66D78]">
                        Items ordered
                      </p>

                      <div className="space-y-5">
                        {(order.items || []).map((item, index) => (
                          <div
                            key={item.cartItemId || item.id || index}
                            className="flex items-center gap-4"
                          >
                            <img
                              src={item.image || ""}
                              alt={item.name}
                              className="h-16 w-16 rounded-xl bg-[#FAF5F2] object-cover"
                            />

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-[#762F43]">
                                {item.name}
                              </p>

                              <p className="mt-1 text-xs text-[#927F80]">
                                Quantity: {item.quantity}
                              </p>

                              {item.selectedSize && (
                                <p className="mt-1 text-xs text-[#927F80]">
                                  Size: {item.selectedSize.name} ·{" "}
                                  {item.selectedSize.width} ×{" "}
                                  {item.selectedSize.height}{" "}
                                  {item.selectedSize.unit || "mm"}
                                </p>
                              )}
                            </div>

                            <p className="shrink-0 text-sm font-semibold text-[#762F43]">
                              ₹{formatPrice(item.subtotal)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PAYMENT */}
                    <div className="mt-7 rounded-xl bg-[#FAF5F2] p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#762F43]">
                        Payment information
                      </p>

                      <p className="mt-2 text-sm text-[#806F70]">
                        Method: {order.paymentMethod || "UPI"}
                      </p>

                      <p className="mt-1 text-xs text-[#927F80]">
                        Payment status: {order.paymentStatus || "Pending Verification"}
                      </p>

                      {order.paymentStatus === "Rejected" && (
                        <p className="mt-3 text-xs leading-5 text-red-600">
                          Your payment proof was rejected. Please contact
                          customer support before making another payment.
                        </p>
                      )}
                    </div>

                  </div>
                </article>
              );
            })}

          </div>
        )}
      </div>
    </main>
  );
}