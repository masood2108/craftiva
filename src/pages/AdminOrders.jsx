import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  subscribeToOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../services/orderService";

const ORDER_STATUSES = [
  "Pending",
  "Payment Verification",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const PAYMENT_STATUSES = [
  "Pending Verification",
  "Verified",
  "Rejected",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      (data) => {
        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Unable to load orders");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id, status) => {
    setUpdating((old) => ({ ...old, [id]: true }));

    try {
      await updateOrderStatus(id, status);
      toast.success("Order status updated");
    } catch (error) {
      console.error(error);
      toast.error("Could not update order status");
    } finally {
      setUpdating((old) => ({ ...old, [id]: false }));
    }
  };

  const handlePaymentChange = async (id, paymentStatus) => {
    setUpdating((old) => ({ ...old, [id]: true }));

    try {
      await updatePaymentStatus(id, paymentStatus);

      toast.success(
        paymentStatus === "Verified"
          ? "Payment verified successfully"
          : paymentStatus === "Rejected"
          ? "Payment rejected"
          : "Payment status updated"
      );
    } catch (error) {
      console.error(error);
      toast.error("Could not update payment status");
    } finally {
      setUpdating((old) => ({ ...old, [id]: false }));
    }
  };

  const filteredOrders = orders.filter((order) => {
    const customerName = (
      order.customerName || order.name || ""
    ).toLowerCase();

    const query = search.toLowerCase();

    const matchesSearch =
      customerName.includes(query) ||
      (order.phone || "").includes(search) ||
      (order.email || "").toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query);

    const matchesOrderFilter =
      filter === "All" || order.status === filter;

    const matchesPaymentFilter =
      paymentFilter === "All" ||
      (order.paymentStatus || "Pending Verification") === paymentFilter;

    return (
      matchesSearch &&
      matchesOrderFilter &&
      matchesPaymentFilter
    );
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";

    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN");

  const paymentBadge = (status) => {
    const styles = {
      Verified: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
      "Pending Verification": "bg-amber-100 text-amber-700",
    };

    return styles[status] || "bg-gray-100 text-gray-600";
  };

  const orderBadge = (status) => {
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

  const pendingPayments = orders.filter(
    (order) =>
      (order.paymentStatus || "Pending Verification") ===
      "Pending Verification"
  ).length;

  const verifiedPayments = orders.filter(
    (order) => order.paymentStatus === "Verified"
  ).length;

  const rejectedPayments = orders.filter(
    (order) => order.paymentStatus === "Rejected"
  ).length;

  return (
    <main className="min-h-screen bg-[#FAF5F2] px-4 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">

        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#806F70] transition hover:text-[#762F43]"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        {/* HEADER */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#A66D78]">
              Store management
            </p>

            <h1 className="display-font mt-2 text-5xl text-[#762F43]">
              Orders
            </h1>

            <p className="mt-2 text-sm text-[#927F80]">
              Manage customer orders and verify payments.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E9D8D6] bg-white px-7 py-5">
            <p className="text-xs text-[#927F80]">
              Total orders
            </p>

            <p className="mt-1 text-3xl font-semibold text-[#762F43]">
              {orders.length}
            </p>
          </div>
        </div>

        {/* PAYMENT SUMMARY */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E9D8D6] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#927F80]">
                Pending verification
              </p>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>

            <p className="mt-3 text-3xl font-semibold text-amber-600">
              {pendingPayments}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E9D8D6] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#927F80]">
                Verified payments
              </p>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>

            <p className="mt-3 text-3xl font-semibold text-green-600">
              {verifiedPayments}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E9D8D6] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#927F80]">
                Rejected payments
              </p>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>

            <p className="mt-3 text-3xl font-semibold text-red-500">
              {rejectedPayments}
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <div className="flex items-center gap-3 rounded-xl border border-[#E9D8D6] bg-white px-4">
            <Search size={17} className="text-[#A66D78]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, phone or order ID..."
              className="w-full py-4 text-sm outline-none"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-[#E9D8D6] bg-white px-4 py-4 text-sm text-[#762F43] outline-none"
          >
            <option value="All">All order statuses</option>

            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-xl border border-[#E9D8D6] bg-white px-4 py-4 text-sm text-[#762F43] outline-none"
          >
            <option value="All">All payment statuses</option>

            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* ORDERS */}
        <section className="mt-8 space-y-6">

          {loading ? (
            <div className="rounded-2xl bg-white p-12 text-center text-sm text-[#927F80]">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl bg-white p-14 text-center">
              <Package
                size={38}
                className="mx-auto text-[#DFC6C5]"
              />

              <h2 className="mt-4 font-semibold text-[#762F43]">
                No orders found
              </h2>

              <p className="mt-2 text-sm text-[#927F80]">
                Customer orders will appear here.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const paymentStatus =
                order.paymentStatus || "Pending Verification";

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-[#E9D8D6] bg-white"
                >

                  {/* ORDER HEADER */}
                  <div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#F0E5E2] p-5 sm:p-6">

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A66D78]">
                        Order ID
                      </p>

                      <p className="mt-2 break-all text-sm font-semibold text-[#762F43]">
                        {order.id}
                      </p>

                      <p className="mt-2 text-xs text-[#927F80]">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A66D78]">
                        Total amount
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-[#762F43]">
                        ₹{formatPrice(order.total ?? order.totalAmount)}
                      </p>
                    </div>

                  </div>

                  <div className="p-5 sm:p-6">

                    {/* STATUS BADGES */}
                    <div className="mb-6 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${orderBadge(
                          order.status || "Pending"
                        )}`}
                      >
                        Order: {order.status || "Pending"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${paymentBadge(
                          paymentStatus
                        )}`}
                      >
                        Payment: {paymentStatus}
                      </span>
                    </div>

                    {/* CUSTOMER DETAILS */}
                    <div className="grid gap-6 border-y border-[#F0E5E2] py-6 md:grid-cols-3">

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A66D78]">
                          Customer
                        </p>

                        <p className="mt-3 text-sm font-semibold text-[#762F43]">
                          {order.customerName || order.name || "—"}
                        </p>

                        <p className="mt-2 flex items-center gap-2 text-xs text-[#806F70]">
                          <Phone size={13} />
                          {order.phone || "—"}
                        </p>

                        <p className="mt-2 flex items-center gap-2 break-all text-xs text-[#806F70]">
                          <Mail size={13} />
                          {order.email || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A66D78]">
                          Payment details
                        </p>

                        <p className="mt-3 text-sm font-semibold text-[#762F43]">
                          {order.paymentMethod || "UPI"}
                        </p>

                        <p className="mt-2 break-all text-xs text-[#806F70]">
                          Transaction ID:
                          <br />
                          {order.paymentReference || "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A66D78]">
                          Delivery address
                        </p>

                        <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-[#806F70]">
                          <MapPin
                            size={15}
                            className="mt-1 shrink-0"
                          />
                          {order.address || order.deliveryAddress || "—"}
                        </p>
                      </div>

                    </div>

                    {/* PAYMENT SCREENSHOT */}
                    <div className="mt-6 rounded-xl border border-[#E9D8D6] bg-[#FAF5F2] p-5">

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-[#762F43]">
                            Payment proof
                          </p>

                          <p className="mt-1 text-xs text-[#927F80]">
                            Customer-submitted UPI payment screenshot
                          </p>
                        </div>

                        {paymentStatus === "Verified" ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
                            <CheckCircle2 size={15} />
                            Verified
                          </span>
                        ) : paymentStatus === "Rejected" ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                            <XCircle size={15} />
                            Rejected
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                            <Clock size={15} />
                            Awaiting verification
                          </span>
                        )}
                      </div>

                      {order.paymentScreenshot ? (
                        <div className="mt-5">
                          <a
                            href={order.paymentScreenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-[#762F43] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#5E2334]"
                          >
                            <ImageIcon size={15} />
                            View payment screenshot
                            <ExternalLink size={13} />
                          </a>

                          <div className="mt-4">
                            <img
                              src={order.paymentScreenshot}
                              alt="Customer payment proof"
                              loading="lazy"
                              className="max-h-80 max-w-full rounded-xl border border-[#E9D8D6] bg-white object-contain"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-red-600">
                          No payment screenshot submitted.
                        </p>
                      )}

                    </div>

                    {/* ORDERED PRODUCTS */}
                    <div className="mt-7">
                      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#A66D78]">
                        Ordered items
                      </p>

                      <div className="space-y-4">
                        {(order.items || []).map((item, index) => (
                          <div
                            key={item.cartItemId || item.id || index}
                            className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E5E2] pb-4"
                          >
                            <div className="flex min-w-0 items-center gap-4">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-16 w-16 rounded-lg bg-[#FAF5F2] object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#FAF5F2]">
                                  <Package className="text-[#A66D78]" />
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#762F43]">
                                  {item.name || "Product"}
                                </p>

                                <p className="mt-1 text-xs text-[#927F80]">
                                  ₹{formatPrice(item.price)} × {item.quantity || 1}
                                </p>

                                {item.selectedSize && (
                                  <p className="mt-1 text-xs text-[#927F80]">
                                    {item.selectedSize.name} ·{" "}
                                    {item.selectedSize.width} ×{" "}
                                    {item.selectedSize.height}{" "}
                                    {item.selectedSize.unit || "mm"}
                                  </p>
                                )}
                              </div>
                            </div>

                            <p className="text-sm font-semibold text-[#762F43]">
                              ₹
                              {formatPrice(
                                item.subtotal ??
                                Number(item.price || 0) *
                                Number(item.quantity || 1)
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ADMIN CONTROLS */}
                    <div className="mt-7 grid gap-5 border-t border-[#F0E5E2] pt-6 md:grid-cols-2">

                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#A66D78]">
                          Order status
                        </label>

                        <select
                          value={order.status || "Pending"}
                          disabled={!!updating[order.id]}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className="w-full rounded-xl border border-[#E9D8D6] bg-white px-4 py-3 text-sm text-[#762F43] outline-none focus:border-[#762F43] disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#A66D78]">
                          Payment verification
                        </label>

                        <select
                          value={paymentStatus}
                          disabled={!!updating[order.id]}
                          onChange={(e) =>
                            handlePaymentChange(order.id, e.target.value)
                          }
                          className="w-full rounded-xl border border-[#E9D8D6] bg-white px-4 py-3 text-sm text-[#762F43] outline-none focus:border-[#762F43] disabled:opacity-50"
                        >
                          {PAYMENT_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>

                    {updating[order.id] && (
                      <p className="mt-3 text-xs text-[#927F80]">
                        Updating order...
                      </p>
                    )}

                    {paymentStatus === "Pending Verification" && (
                      <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                        Verify the actual payment in your PhonePe or bank
                        account before selecting Verified. Do not rely
                        solely on the uploaded screenshot.
                      </p>
                    )}

                  </div>
                </article>
              );
            })
          )}

        </section>
      </div>
    </main>
  );
}