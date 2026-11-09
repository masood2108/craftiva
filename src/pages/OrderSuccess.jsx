import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Clock, ShoppingBag, MessageCircle } from "lucide-react";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const createWhatsAppLink = (phone) => {
    const items =
      order?.items
        ?.map(
          (item) =>
            `• ${item.name} | Size: ${item.size || "N/A"} | Qty: ${
              item.quantity
            } | ${formatPrice(item.subtotal)}`
        )
        .join("\n") || "Order details unavailable";

    const message = `
Hello CRAFTIVA! I have placed an order.

Order ID: ${orderId}
Name: ${order?.customerName || ""}
Phone: ${order?.phone || ""}

Items:
${items}

Total: ${formatPrice(order?.total)}

Payment: UPI
Payment Status: Pending Verification

Please confirm my order. Thank you!
    `.trim();

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-[#EDE5DF] p-8 md:p-12 text-center">

        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={42} className="text-green-600" />
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-[#542D3A] mb-3">
          Order Placed!
        </h1>

        <p className="text-gray-500 mb-8">
          Thank you for shopping with CRAFTIVA. Your order has been received.
        </p>

        <div className="bg-[#FAF7F2] rounded-2xl p-5 mb-6 text-left">
          <p className="text-sm text-gray-500 mb-1">Order ID</p>
          <p className="font-semibold text-[#542D3A] break-all">
            {orderId}
          </p>

          <div className="flex items-center gap-2 mt-5 text-amber-700">
            <Clock size={18} />
            <span className="text-sm font-medium">
              Payment verification pending
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Your order will be processed after payment verification.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <p className="text-sm font-medium text-gray-700">
            Notify us about your order on WhatsApp
          </p>

          <a
            href={createWhatsAppLink("9770633408")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-medium transition"
          >
            <MessageCircle size={19} />
            WhatsApp Store 1
          </a>

          <a
            href={createWhatsAppLink("8602408006")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 border border-green-600 text-green-700 hover:bg-green-50 py-3.5 rounded-xl font-medium transition"
          >
            <MessageCircle size={19} />
            WhatsApp Store 2
          </a>
        </div>

        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 bg-[#542D3A] hover:bg-[#6B3A4A] text-white py-3.5 rounded-xl font-medium transition"
        >
          <ShoppingBag size={19} />
          Continue Shopping
        </Link>

      </div>
    </div>
  );
}