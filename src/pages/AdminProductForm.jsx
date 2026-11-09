import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  addProduct,
  updateProduct,
  subscribeToProducts,
} from "../services/productService";

import { uploadImage } from "../services/cloudinaryService";

// Storefront categories
const PRODUCT_CATEGORIES = [
  "Posters & Wall Art",
  "3D Car & Figure Frames",
];

const createDefaultSizes = () => [
  {
    id: "standard",
    name: "Standard",
    width: "203",
    height: "254",
    unit: "mm",
    price: "",
    originalPrice: "",
    stock: "",
  },
  {
    id: "large",
    name: "Large",
    width: "305",
    height: "381",
    unit: "mm",
    price: "",
    originalPrice: "",
    stock: "",
  },
];

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category: PRODUCT_CATEGORIES[0],
    subcategory: "",
    description: "",
    originalPrice: "",
    price: "",
    stock: "",
    available: true,
    enableSizes: false,
    sizes: createDefaultSizes(),
  });

  // Load existing product when editing
  useEffect(() => {
    if (!isEditing) return;

    const unsubscribe = subscribeToProducts(
      (products) => {
        const product = products.find((item) => item.id === id);

        if (!product) {
          toast.error("Product not found");
          navigate("/admin/dashboard");
          return;
        }

        setForm({
          name: product.name || "",
          category: product.category || PRODUCT_CATEGORIES[0],
          subcategory: product.subcategory || "",
          description: product.description || "",
          originalPrice: product.originalPrice ?? "",
          price: product.price ?? "",
          stock: product.stock ?? "",
          available: product.available !== false,
          enableSizes: product.enableSizes === true,
          sizes:
            product.sizes?.length > 0
              ? product.sizes.map((size) => ({
                  id: size.id || crypto.randomUUID(),
                  name: size.name || "",
                  width: size.width ?? "",
                  height: size.height ?? "",
                  unit: size.unit || "mm",
                  price: size.price ?? "",
                  originalPrice: size.originalPrice ?? "",
                  stock: size.stock ?? "",
                }))
              : createDefaultSizes(),
        });

        setImages(
          product.images?.length
            ? product.images
            : product.image
              ? [product.image]
              : []
        );

        setFetching(false);
      },
      (error) => {
        console.error(error);
        toast.error("Unable to load product");
        setFetching(false);
      }
    );

    return () => unsubscribe();
  }, [id, isEditing, navigate]);

  // General form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((old) => ({
      ...old,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Size changes
  const handleSizeChange = (index, field, value) => {
    setForm((old) => ({
      ...old,
      sizes: old.sizes.map((size, i) =>
        i === index ? { ...size, [field]: value } : size
      ),
    }));
  };

  // Add size
  const addSize = () => {
    setForm((old) => ({
      ...old,
      sizes: [
        ...old.sizes,
        {
          id: crypto.randomUUID(),
          name: "",
          width: "",
          height: "",
          unit: "mm",
          price: "",
          originalPrice: "",
          stock: "",
        },
      ],
    }));
  };

  // Remove size
  const removeSize = (index) => {
    setForm((old) => ({
      ...old,
      sizes: old.sizes.filter((_, i) => i !== index),
    }));
  };

  // Upload images to Cloudinary
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files are allowed");
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Each image must be under 5 MB");
        }

        const url = await uploadImage(file);
        uploadedUrls.push(url);
      }

      setImages((old) => [...old, ...uploadedUrls]);

      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Remove image
  const removeImage = (index) => {
    setImages((old) => old.filter((_, i) => i !== index));
  };

  // Save product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Enter product name");
      return;
    }

    if (!PRODUCT_CATEGORIES.includes(form.category)) {
      toast.error("Select a valid product category");
      return;
    }

    if (images.length === 0) {
      toast.error("Upload at least one product image");
      return;
    }

    let productData;

    if (form.enableSizes) {
      if (!form.sizes.length) {
        toast.error("Add at least one product size");
        return;
      }

      const validSizes = [];

      for (const size of form.sizes) {
        const price = Number(size.price);
        const originalPrice = Number(size.originalPrice);
        const sizeStock = Number(size.stock);
        const width = Number(size.width);
        const height = Number(size.height);

        if (
          !size.name.trim() ||
          !Number.isFinite(width) ||
          !Number.isFinite(height) ||
          width <= 0 ||
          height <= 0 ||
          !Number.isFinite(price) ||
          !Number.isFinite(originalPrice) ||
          !Number.isInteger(sizeStock) ||
          price <= 0 ||
          originalPrice < price ||
          sizeStock < 0
        ) {
          toast.error(
            `Check dimensions, prices and stock for ${size.name || "each size"}`
          );
          return;
        }

        validSizes.push({
          id: size.id,
          name: size.name.trim(),
          width,
          height,
          unit: size.unit,
          price,
          originalPrice,
          stock: sizeStock,
          available: sizeStock > 0,
        });
      }

      productData = {
        name: form.name.trim(),
        category: form.category,
        subcategory: form.subcategory.trim(),
        description: form.description.trim(),
        enableSizes: true,
        sizes: validSizes,
        price: validSizes[0].price,
        originalPrice: validSizes[0].originalPrice,
        stock: validSizes.reduce(
          (sum, size) => sum + size.stock,
          0
        ),
        available:
          form.available &&
          validSizes.some((size) => size.stock > 0),
        images,
        image: images[0],
      };
    } else {
      const originalPrice = Number(form.originalPrice);
      const price = Number(form.price);
      const stock = Number(form.stock);

      if (
        !Number.isFinite(originalPrice) ||
        !Number.isFinite(price) ||
        !Number.isInteger(stock) ||
        originalPrice <= 0 ||
        price <= 0 ||
        stock < 0 ||
        price > originalPrice
      ) {
        toast.error(
          "Please check product details, prices and stock"
        );
        return;
      }

      productData = {
        name: form.name.trim(),
        category: form.category,
        subcategory: form.subcategory.trim(),
        description: form.description.trim(),
        originalPrice,
        price,
        stock,
        available: form.available && stock > 0,
        enableSizes: false,
        sizes: [],
        images,
        image: images[0],
      };
    }

    setLoading(true);

    try {
      if (isEditing) {
        await updateProduct(id, productData);
        toast.success("Product updated successfully");
      } else {
        await addProduct(productData);
        toast.success("Product added successfully");
      }

      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);

      toast.error(
        isEditing
          ? "Could not update product"
          : "Could not add product"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#DFC6C5] bg-white px-4 py-3 text-sm outline-none focus:border-[#762F43]";

  if (fetching) {
    return (
      <div className="p-20 text-center">
        Loading product details...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF5F2] px-5 py-10 md:px-10">
      <div className="mx-auto max-w-4xl">

        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#762F43]"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.25em] text-[#A66D78]">
            Catalogue management
          </p>

          <h1 className="display-font mt-2 text-4xl font-semibold text-[#762F43]">
            {isEditing ? "Edit product" : "Add product"}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-8 rounded-2xl border border-[#E9D8D6] bg-white p-6 md:p-10"
        >

          {/* Basic Information */}
          <section>
            <h2 className="mb-5 font-semibold text-[#762F43]">
              Basic information
            </h2>

            <div className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Product name *
                </label>

                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: Supra 3D Car Frame"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* UPDATED CATEGORY DROPDOWN */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Category *
                  </label>

                  <select
                    required
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Subcategory
                  </label>

                  <input
                    name="subcategory"
                    value={form.subcategory}
                    onChange={handleChange}
                    placeholder="Anime, Ferrari, Aesthetic..."
                    className={inputClass}
                  />
                </div>

              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe your product..."
                  className={inputClass}
                />
              </div>

            </div>
          </section>

          {/* Size Options */}
          <section className="border-t border-[#E9D8D6] pt-7">

            <h2 className="font-semibold text-[#762F43]">
              Product size options
            </h2>

            <p className="mt-2 text-xs text-gray-500">
              Enable this for frames, posters or products with different dimensions.
            </p>

            <label className="mt-5 flex items-center gap-3 rounded-xl bg-[#FAF5F2] p-4 text-sm">
              <input
                type="checkbox"
                name="enableSizes"
                checked={form.enableSizes}
                onChange={handleChange}
              />
              Enable selectable product sizes
            </label>

            {form.enableSizes && (
              <div className="mt-6 space-y-5">

                {form.sizes.map((size, index) => (
                  <div
                    key={size.id}
                    className="rounded-xl border border-[#E9D8D6] p-5"
                  >

                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="font-semibold text-[#762F43]">
                        Size option {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="text-red-500"
                        aria-label="Remove size"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                      <div>
                        <label className="mb-2 block text-xs">
                          Size name *
                        </label>

                        <input
                          value={size.name}
                          onChange={(e) =>
                            handleSizeChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Standard"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs">
                          Measurement unit
                        </label>

                        <select
                          value={size.unit}
                          onChange={(e) =>
                            handleSizeChange(
                              index,
                              "unit",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        >
                          <option value="mm">Millimetres (mm)</option>
                          <option value="in">Inches (in)</option>
                          <option value="cm">Centimetres (cm)</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs">
                          Width *
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={size.width}
                          onChange={(e) =>
                            handleSizeChange(
                              index,
                              "width",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs">
                          Height *
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={size.height}
                          onChange={(e) =>
                            handleSizeChange(
                              index,
                              "height",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs">
                          Selling price (₹) *
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={size.price}
                          onChange={(e) =>
                            handleSizeChange(
                              index,
                              "price",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs">
                          Original price (₹) *
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={size.originalPrice}
                          onChange={(e) =>
                            handleSizeChange(
                              index,
                              "originalPrice",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs">
                          Stock quantity *
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={size.stock}
                          onChange={(e) =>
                            handleSizeChange(
                              index,
                              "stock",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </div>

                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSize}
                  className="flex items-center gap-2 rounded-full border border-[#762F43] px-5 py-3 text-sm font-semibold text-[#762F43] hover:bg-[#FAF5F2]"
                >
                  <Plus size={17} />
                  Add another size
                </button>

              </div>
            )}
          </section>

          {/* Regular Pricing */}
          {!form.enableSizes && (
            <section className="border-t border-[#E9D8D6] pt-7">

              <h2 className="mb-5 font-semibold text-[#762F43]">
                Pricing and inventory
              </h2>

              <div className="grid gap-5 md:grid-cols-3">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Original price (₹) *
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    name="originalPrice"
                    value={form.originalPrice}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Selling price (₹) *
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Stock quantity *
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

              </div>
            </section>
          )}

          {/* Availability */}
          <section className="border-t border-[#E9D8D6] pt-7">

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
              />
              Product is available for purchase
            </label>

          </section>

          {/* Images */}
          <section className="border-t border-[#E9D8D6] pt-7">

            <h2 className="mb-2 font-semibold text-[#762F43]">
              Product images
            </h2>

            <p className="mb-5 text-xs text-gray-500">
              Upload up to 5 images. JPG, PNG or WEBP. Maximum 5 MB each.
            </p>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#C9A4A8] px-5 py-10 text-center hover:border-[#762F43]">

              <Upload size={25} />

              <span className="mt-3 text-sm font-medium">
                {uploading
                  ? "Uploading..."
                  : "Click to upload images"}
              </span>

              <span className="mt-1 text-xs text-gray-400">
                Images are uploaded to Cloudinary
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={uploading || loading}
                onChange={handleImageUpload}
                className="hidden"
              />

            </label>

            {images.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">

                {images.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative"
                  >

                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="aspect-square w-full rounded-lg object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-white p-1"
                      aria-label="Remove image"
                    >
                      <X size={15} />
                    </button>

                    {index === 0 && (
                      <span className="mt-1 block text-center text-[10px] text-gray-500">
                        Main image
                      </span>
                    )}

                  </div>
                ))}

              </div>
            )}

          </section>

          {/* Submit */}
          <div className="border-t border-[#E9D8D6] pt-7">

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full rounded-full bg-[#762F43] py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#5E2334] disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update product"
                  : "Save product"}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}