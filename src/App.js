import { useState } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import toast from "react-hot-toast";

import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";

import PaymentScreenshots from "./pages/PaymentScreenshots";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyOrders from "./pages/MyOrders";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProductForm from "./pages/AdminProductForm";
import AdminOrders from "./pages/AdminOrders";
import AdminSettings from "./pages/AdminSettings";

function Footer() {
  return (
    <footer className="bg-ink py-16 text-white">
      <div className="container-shell grid gap-12 md:grid-cols-3">

        <div>
          <Link
            to="/"
            className="display-font text-4xl font-semibold tracking-[0.12em]"
          >
            CRAFTIVA<span className="text-accent">.</span>
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-7 text-white/60">
            Art for your walls. Icons for your shelf.
            Discover pieces that express your personality.
          </p>

          <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-white/40">
            Made for your space.
          </p>
        </div>

        <div>
          <p className="eyebrow text-white/50">Explore</p>

          <div className="mt-6 flex flex-col gap-4 text-sm text-white/75">
            <a href="/#posters" className="hover:text-white">
              Posters & Wall Art
            </a>

            <a href="/#cars" className="hover:text-white">
              Die-Cast Cars
            </a>

            <a href="/#collections" className="hover:text-white">
              Collections
            </a>

            <Link to="/my-orders" className="hover:text-white">
              My Orders
            </Link>

            <Link to="/login" className="hover:text-white">
              My Account
            </Link>

            <Link to="/cart" className="hover:text-white">
              Shopping Bag
            </Link>
          </div>
        </div>

        <div>
          <p className="eyebrow text-white/50">Customer Support</p>

          <p className="mt-6 max-w-xs text-sm leading-7 text-white/65">
            Have questions about products or orders?
            We're here to help make your shopping experience
            simple and enjoyable.
          </p>

          <a
            href="mailto:karansahu@gmail.com"
            className="mt-6 inline-block border-b border-white/40 pb-1 text-xs uppercase tracking-widest hover:border-white"
          >
            Contact Us
          </a>
        </div>

      </div>

      <div className="container-shell mt-16 flex flex-col justify-between gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center">
        <p className="text-[10px] tracking-[0.18em] text-white/45">
          © 2026 CRAFTIVA. ALL RIGHTS RESERVED.
        </p>

        <p className="text-[10px] tracking-[0.18em] text-white/45">
          ART · DESIGN · COLLECTIBLES
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);

  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");

  const getCartItemKey = (item) =>
    item.cartItemId || item.id;

  const addToCart = (product) => {
    const cartKey = getCartItemKey(product);
    const incomingQuantity = Number(product.quantity || 1);

    setCart((old) => {
      const found = old.find(
        (item) => getCartItemKey(item) === cartKey
      );

      if (found) {
        return old.map((item) =>
          getCartItemKey(item) === cartKey
            ? {
                ...item,
                quantity: item.quantity + incomingQuantity,
              }
            : item
        );
      }

      return [
        ...old,
        {
          ...product,
          quantity: incomingQuantity,
        },
      ];
    });

    toast.success("Added to your bag");
  };

  const update = (cartItemId, quantity) => {
    setCart((old) =>
      old.map((item) =>
        getCartItemKey(item) === cartItemId
          ? {
              ...item,
              quantity: Math.max(1, Number(quantity)),
            }
          : item
      )
    );
  };

  const remove = (cartItemId) => {
    setCart((old) =>
      old.filter(
        (item) => getCartItemKey(item) !== cartItemId
      )
    );

    toast.success("Removed from bag");
  };

  const cartCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <>
      <ScrollToTop />

      {!isAdminPage && (
        <Navbar cartCount={cartCount} />
      )}

      <Routes>

        {/* STOREFRONT */}
        <Route
          path="/"
          element={<Home onAdd={addToCart} />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails onAdd={addToCart} />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/my-orders"
          element={<MyOrders />}
        />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              onUpdate={update}
              onRemove={remove}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              onOrderPlaced={() => setCart([])}
            />
          }
        />

        <Route
          path="/order-success/:orderId"
          element={<OrderSuccess />}
        />

        {/* ADMIN LOGIN */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* ADMIN SETTINGS */}
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          }
        />

        {/* ADD PRODUCT */}
        <Route
          path="/admin/products/new"
          element={
            <AdminRoute>
              <AdminProductForm />
            </AdminRoute>
          }
        />

        {/* EDIT PRODUCT */}
        <Route
          path="/admin/products/edit/:id"
          element={
            <AdminRoute>
              <AdminProductForm />
            </AdminRoute>
          }
        />

        {/* ORDERS */}
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />

        {/* PAYMENT SCREENSHOTS */}
        <Route
          path="/admin/payments"
          element={
            <AdminRoute>
              <PaymentScreenshots />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <main className="container-shell py-28 text-center">
              <p className="eyebrow text-accent">
                Lost your way?
              </p>

              <h1 className="display-font mt-4 text-6xl">
                Page not found
              </h1>

              <p className="mt-4 text-sm text-muted">
                The page you're looking for doesn't exist.
              </p>

              <Link
                to="/"
                className="mt-8 inline-block bg-ink px-8 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-accent"
              >
                Back to CRAFTIVA
              </Link>
            </main>
          }
        />

      </Routes>

      {!isAdminPage && <Footer />}
    </>
  );
}