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
} from "lucide-react";

import {
  subscribeToProducts,
  deleteProduct,
} from "../services/productService";

const categories = [
  "All",
  "Posters",
  "Frames",
  "Sale",
  "Stock",
];

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

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
          return category.includes("poster") || subcategory.includes("poster");

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
            product.discount > 0 ||
            product.originalPrice > product.price
          );

        case "Stock":
          return product.available !== false;

        default:
          return true;
      }
    });
  }, [products, activeCategory]);

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 flex-col bg-[#171717] p-7 text-white md:flex">
          <h1 className="display-font text-2xl font-bold tracking-widest">
            CRAFTIVA<span className="text-[#b58a57]">.</span>
          </h1>

          <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
            Store administration
          </p>

          <nav className="mt-14 space-y-3">
            <div className="flex items-center gap-3 bg-white/10 px-4 py-3 text-sm">
              <Package size={17} />
              Products
            </div>

            <Link
              to="/admin/orders"
              className="flex items-center gap-3 px-4 py-3 text-sm text-white/50 hover:bg-white/10 hover:text-white"
            >
              <ShoppingBag size={17} />
              Orders
            </Link>

            <Link
  to="/admin/payments"
  className="flex items-center gap-3 px-4 py-3 text-sm text-white/50 hover:bg-white/10 hover:text-white"
>
  <CreditCard size={17} />
  Payment Screenshots
</Link>

            <div className="flex items-center gap-3 px-4 py-3 text-sm text-white/50">
              <Settings size={17} />
              Settings
            </div>
          </nav>

          <Link
            to="/"
            className="mt-auto flex items-center gap-3 text-sm text-white/60 hover:text-white"
          >
            <LogOut size={17} />
            Back to storefront
          </Link>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 p-6 md:p-10">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
                Overview
              </p>

              <h2 className="display-font mt-2 text-3xl font-semibold">
                Products
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Manage your CRAFTIVA product catalogue.
              </p>
            </div>

            <Link
              to="/admin/products/new"
              className="flex items-center gap-2 bg-[#171717] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#b58a57]"
            >
              <Plus size={16} />
              Add product
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="border border-[#e8e5de] bg-white p-6">
              <p className="text-xs text-gray-400">Total products</p>
              <h3 className="mt-3 text-3xl font-semibold">
                {products.length}
              </h3>
            </div>

            <div className="border border-[#e8e5de] bg-white p-6">
              <p className="text-xs text-gray-400">Available products</p>
              <h3 className="mt-3 text-3xl font-semibold">
                {products.filter((product) => product.available !== false).length}
              </h3>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <h3 className="text-sm font-semibold">Filter by category</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
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

          {/* Product List */}
          <section className="mt-6 border border-[#e8e5de] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e5de] px-6 py-5">
              <h3 className="font-semibold">
                {activeCategory === "All"
                  ? "Product catalogue"
                  : `${activeCategory} products`}
              </h3>

              <span className="text-xs text-gray-400">
                {filteredProducts.length} products
              </span>
            </div>

            {loading ? (
              <p className="p-8 text-sm text-gray-500">
                Loading products...
              </p>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto text-gray-300" size={35} />

                <p className="mt-4 font-medium">
                  No products found
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  No products available in this category.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                              className="h-12 w-12 bg-gray-100 object-cover"
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
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/admin/products/edit/${product.id}`}
                              className="text-gray-500 hover:text-black"
                              aria-label="Edit product"
                            >
                              <Pencil size={17} />
                            </Link>

                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-gray-400 hover:text-red-600"
                              aria-label="Delete product"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}