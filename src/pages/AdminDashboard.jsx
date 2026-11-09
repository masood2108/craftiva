import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Pencil,
  Trash2,
  Filter,
  CreditCard,
  Menu,
  X,
  Store,
} from "lucide-react";

import {
  subscribeToProducts,
  deleteProduct,
} from "../services/productService";

const categories = ["All", "Posters", "Frames", "Sale", "Stock"];

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Unable to load products");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await deleteProduct(id);
      toast.success("Product deleted");
    } catch (error) {
      console.error(error);
      toast.error("Could not delete product");
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;

    return products.filter((product) => {
      const category = (product.category || "").toLowerCase();
      const subcategory = (product.subcategory || "").toLowerCase();

      switch (activeCategory) {
        case "Posters":
          return (
            category.includes("poster") ||
            category.includes("wall art") ||
            subcategory.includes("poster")
          );

        case "Frames":
          return (
            category.includes("frame") ||
            category.includes("3d") ||
            subcategory.includes("frame") ||
            subcategory.includes("3d")
          );

        case "Sale":
          return (
            product.sale === true ||
            product.onSale === true ||
            Number(product.discount) > 0 ||
            Number(product.originalPrice) > Number(product.price)
          );

        case "Stock":
          return (
            product.available !== false &&
            Number(product.stock ?? 1) > 0
          );

        default:
          return true;
      }
    });
  }, [products, activeCategory]);

  const navigation = [
    {
      label: "Products",
      icon: Package,
      to: "/admin/dashboard",
      active: true,
    },
    {
      label: "Orders",
      icon: ShoppingBag,
      to: "/admin/orders",
    },
    {
      label: "Payment Screenshots",
      icon: CreditCard,
      to: "/admin/payments",
    },
  ];

  const SidebarContent = ({ mobile = false }) => (
    <>
      <div className="mb-12">
        <h1 className="display-font text-2xl font-bold tracking-widest">
          CRAFTIVA<span className="text-[#b58a57]">.</span>
        </h1>

        <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
          Store administration
        </p>
      </div>

      <nav className="space-y-3">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => mobile && setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                item.active
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}

        <div className="flex items-center gap-3 px-4 py-3 text-sm text-white/40">
          <Settings size={18} />
          Settings
        </div>
      </nav>

      <Link
        to="/"
        onClick={() => mobile && setMobileMenuOpen(false)}
        className="mt-auto flex items-center gap-3 pt-10 text-sm text-white/60 hover:text-white"
      >
        <Store size={18} />
        Back to storefront
      </Link>
    </>
  );

  const ProductActions = ({ product }) => (
    <div className="flex items-center gap-3">
      <Link
        to={`/admin/products/edit/${product.id}`}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
        aria-label="Edit product"
      >
        <Pencil size={17} />
      </Link>

      <button
        onClick={() => handleDelete(product.id)}
        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
        aria-label="Delete product"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <div className="flex min-h-screen">

        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col bg-[#171717] p-7 text-white md:flex">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60"
            />

            <aside className="absolute left-0 top-0 flex h-full w-[280px] max-w-[85vw] flex-col bg-[#171717] p-7 text-white shadow-2xl">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-white/40">
                  Navigation
                </span>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full p-2 hover:bg-white/10"
                  aria-label="Close navigation"
                >
                  <X size={20} />
                </button>
              </div>

              <SidebarContent mobile />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-10">

          {/* Header */}
          <div className="flex items-start justify-between gap-3">

            <div className="flex items-start gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="mt-1 rounded-lg border border-[#e8e5de] bg-white p-2.5 text-gray-700 hover:bg-gray-50 md:hidden"
                aria-label="Open navigation"
              >
                <Menu size={21} />
              </button>

              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 sm:text-xs">
                  Overview
                </p>

                <h2 className="display-font mt-2 text-2xl font-semibold sm:text-3xl">
                  Products
                </h2>

                <p className="mt-2 max-w-xs text-xs text-gray-500 sm:max-w-none sm:text-sm">
                  Manage your CRAFTIVA product catalogue.
                </p>
              </div>
            </div>

            <Link
              to="/admin/products/new"
              className="flex shrink-0 items-center gap-2 bg-[#171717] px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-white transition hover:bg-[#b58a57] sm:px-5 sm:text-xs"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add product</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>

          {/* Statistics */}
          <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5">

            <div className="border border-[#e8e5de] bg-white p-4 sm:p-6">
              <p className="text-[11px] text-gray-400 sm:text-xs">
                Total products
              </p>

              <h3 className="mt-2 text-2xl font-semibold sm:mt-3 sm:text-3xl">
                {products.length}
              </h3>
            </div>

            <div className="border border-[#e8e5de] bg-white p-4 sm:p-6">
              <p className="text-[11px] text-gray-400 sm:text-xs">
                Available products
              </p>

              <h3 className="mt-2 text-2xl font-semibold sm:mt-3 sm:text-3xl">
                {products.filter(
                  (product) => product.available !== false
                ).length}
              </h3>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-8 sm:mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <h3 className="text-sm font-semibold">
                Filter by category
              </h3>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition sm:px-5 sm:text-xs ${
                    activeCategory === category
                      ? "bg-[#171717] text-white"
                      : "border border-[#e8e5de] bg-white text-gray-500 hover:border-[#171717] hover:text-black"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Product Catalogue */}
          <section className="mt-5 border border-[#e8e5de] bg-white sm:mt-6">

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8e5de] px-4 py-4 sm:px-6 sm:py-5">
              <h3 className="text-sm font-semibold sm:text-base">
                {activeCategory === "All"
                  ? "Product catalogue"
                  : `${activeCategory} products`}
              </h3>

              <span className="text-[11px] text-gray-400 sm:text-xs">
                {filteredProducts.length} products
              </span>
            </div>

            {loading ? (
              <p className="p-8 text-center text-sm text-gray-500">
                Loading products...
              </p>
            ) : filteredProducts.length === 0 ? (
              <div className="p-10 text-center sm:p-12">
                <Package
                  className="mx-auto text-gray-300"
                  size={35}
                />

                <p className="mt-4 text-sm font-medium">
                  No products found
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  No products available in this category.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Product Cards */}
                <div className="divide-y divide-gray-100 md:hidden">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="p-4">

                      <div className="flex gap-3">
                        <img
                          src={product.image || product.images?.[0]}
                          alt={product.name}
                          className="h-20 w-20 shrink-0 rounded-lg bg-gray-100 object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <h4 className="break-words text-sm font-semibold text-gray-800">
                            {product.name}
                          </h4>

                          <p className="mt-1 text-xs text-gray-400">
                            {product.category || "Uncategorized"}
                          </p>

                          <p className="mt-2 font-semibold text-[#762F43]">
                            ₹{product.price}
                          </p>

                          <span
                            className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              product.available === false
                                ? "bg-red-50 text-red-500"
                                : "bg-green-50 text-green-600"
                            }`}
                          >
                            {product.available === false
                              ? "Unavailable"
                              : "Available"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end border-t border-gray-100 pt-2">
                        <ProductActions product={product} />
                      </div>

                    </div>
                  ))}
                </div>

                {/* Desktop Product Table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-[#faf9f6] text-xs text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Availability</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="border-t border-gray-100"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image || product.images?.[0]}
                                alt={product.name}
                                className="h-12 w-12 rounded-lg bg-gray-100 object-cover"
                              />

                              <span className="font-medium">
                                {product.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            {product.category || "—"}
                          </td>

                          <td className="px-6 py-4 font-medium">
                            ₹{product.price}
                          </td>

                          <td className="px-6 py-4">
                            {product.available === false ? (
                              <span className="text-red-500">
                                Unavailable
                              </span>
                            ) : (
                              <span className="text-green-600">
                                Available
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <ProductActions product={product} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          {/* Mobile Storefront Link */}
          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-2 border border-[#e8e5de] bg-white px-4 py-3 text-xs font-medium text-gray-600 md:hidden"
          >
            <Store size={16} />
            Back to storefront
          </Link>

        </main>
      </div>
    </div>
  );
}