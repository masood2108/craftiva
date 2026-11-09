import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  CreditCard,
} from "lucide-react";

import {
  subscribeToOrders,
  updatePaymentStatus,
} from "../services/orderService";

export default function PaymentScreenshots() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      (data) => {
        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Unable to load payment screenshots");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const paymentOrders = useMemo(() => {
    return orders
      .filter((order) => order.paymentScreenshot)
      .filter((order) => {
        const status = order.paymentStatus || "Pending Verification";

        if (filter !== "All" && status !== filter) return false;

        const searchText = search.toLowerCase();

        return (
          (order.name || order.customerName || "")
            .toLowerCase()
            .includes(searchText) ||
          (order.email || "").toLowerCase().includes(searchText) ||
          (order.phone || "").toLowerCase().includes(searchText) ||
          (order.id || "").toLowerCase().includes(searchText)
        );
      })
      .sort((a, b) => {
        const priority = {
          "Pending Verification": 0,
          Rejected: 1,
          Verified: 2,
        };

        const aPriority = priority[a.paymentStatus || "Pending Verification"] ?? 3;
        const bPriority = priority[b.paymentStatus || "Pending Verification"] ?? 3;

        return aPriority - bPriority;
      });
  }, [orders, filter, search]);

  const pendingCount = orders.filter(
    (order) =>
      order.paymentScreenshot &&
      (!order.paymentStatus ||
        order.paymentStatus === "Pending Verification")
  ).length;

  const verifiedCount = orders.filter(
    (order) =>
      order.paymentScreenshot &&
      order.paymentStatus === "Verified"
  ).length;

  const rejectedCount = orders.filter(
    (order) =>
      order.paymentScreenshot &&
      order.paymentStatus === "Rejected"
  ).length;

  const handlePaymentUpdate = async (orderId, status) => {
    const message =
      status === "Verified"
        ? "Verify this payment?"
        : "Reject this payment?";

    if (!window.confirm(message)) return;

    setUpdatingId(orderId);

    try {
      await updatePaymentStatus(orderId, status);

      toast.success(
        status === "Verified"
          ? "Payment verified successfully"
          : "Payment rejected"
      );
    } catch (error) {
      console.error(error);
      toast.error("Unable to update payment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Verified":
        return "bg-green-50 text-green-700";

      case "Rejected":
        return "bg-red-50 text-red-600";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5F2] px-5 py-8 md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/admin/dashboard"
              className="mb-5 inline-flex items-center gap-2 text-sm text-[#762F43]"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>

            <p className="text-xs uppercase tracking-[0.25em] text-[#A66D78]">
              Payment management
            </p>

            <h1 className="display-font mt-2 text-3xl font-semibold text-[#762F43] md:text-4xl">
              Payment Screenshots
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Review and verify customer payment submissions.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-5 py-4 shadow-sm">
            <CreditCard className="text-[#762F43]" size={22} />
            <div>
              <p className="text-xs text-gray-400">Total submissions</p>
              <p className="text-xl font-semibold">{pendingCount + verifiedCount + rejectedCount}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-[#E9D8D6] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pending verification</p>
              <Clock className="text-amber-600" size={20} />
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-amber-600">
              {pendingCount}
            </h2>
          </div>

          <div className="rounded-xl border border-[#E9D8D6] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Verified payments</p>
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-green-600">
              {verifiedCount}
            </h2>
          </div>

          <div className="rounded-xl border border-[#E9D8D6] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Rejected payments</p>
              <XCircle className="text-red-500" size={20} />
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-red-500">
              {rejectedCount}
            </h2>
          </div>

        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-[#E9D8D6] bg-white p-5 md:flex-row md:items-center md:justify-between">

          <div className="flex flex-wrap gap-2">
            {["All", "Pending Verification", "Verified", "Rejected"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    filter === status
                      ? "bg-[#762F43] text-white"
                      : "border border-[#E9D8D6] text-gray-500 hover:border-[#762F43]"
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>

          <div className="relative w-full md:max-w-xs">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer or order..."
              className="w-full rounded-lg border border-[#E9D8D6] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#762F43]"
            />
          </div>

        </div>

        {/* Payment Cards */}
        <div className="mt-6">

          {loading ? (
            <div className="rounded-xl bg-white p-12 text-center text-sm text-gray-500">
              Loading payment submissions...
            </div>
          ) : paymentOrders.length === 0 ? (
            <div className="rounded-xl border border-[#E9D8D6] bg-white p-14 text-center">
              <ImageIcon
                size={42}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-4 font-semibold text-gray-700">
                No payment screenshots found
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Customer payment submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">

              {paymentOrders.map((order) => {
                const status =
                  order.paymentStatus || "Pending Verification";

                const customerName =
                  order.name || order.customerName || "Customer";

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-[#E9D8D6] bg-white"
                  >

                    {/* Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0E6E4] p-5">

                      <div>
                        <p className="text-xs text-gray-400">
                          Order ID
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold">
                          #{order.id}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${getStatusStyle(status)}`}
                      >
                        {status}
                      </span>

                    </div>

                    <div className="p-5">

                      {/* Customer Details */}
                      <div className="grid gap-4 sm:grid-cols-2">

                        <div>
                          <p className="text-xs text-gray-400">
                            Customer
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {customerName}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Order amount
                          </p>
                          <p className="mt-1 text-lg font-bold text-[#762F43]">
                            ₹{Number(order.total || order.totalAmount || 0).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Phone
                          </p>
                          <p className="mt-1 text-sm">
                            {order.phone || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Transaction ID
                          </p>
                          <p className="mt-1 break-all text-sm">
                            {order.paymentReference || "Not provided"}
                          </p>
                        </div>

                      </div>

                      {/* Screenshot */}
                      <div className="mt-6">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Uploaded payment screenshot
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedImage(order.paymentScreenshot)
                          }
                          className="group relative block w-full overflow-hidden rounded-xl bg-[#FAF5F2]"
                        >
                          <img
                            src={order.paymentScreenshot}
                            alt="Customer payment proof"
                            className="h-64 w-full object-contain transition group-hover:scale-[1.02]"
                          />

                          <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/75 px-4 py-2 text-xs text-white">
                            <ExternalLink size={14} />
                            View full image
                          </span>
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex flex-wrap gap-3">

                        {status !== "Verified" && (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() =>
                              handlePaymentUpdate(order.id, "Verified")
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                            {updatingId === order.id
                              ? "Updating..."
                              : "Verify payment"}
                          </button>
                        )}

                        {status !== "Rejected" && (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() =>
                              handlePaymentUpdate(order.id, "Rejected")
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-red-200 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        )}

                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </div>
      </div>

      {/* Full-size image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-5 top-5 rounded-full bg-white p-2 text-black"
            aria-label="Close image"
          >
            <XCircle size={22} />
          </button>

          <img
            src={selectedImage}
            alt="Full payment screenshot"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
          />
        </div>
      )}

    </div>
  );
}