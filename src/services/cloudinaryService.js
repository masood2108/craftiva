const CLOUD_NAME = "twsjies7";
const UPLOAD_PRESET = "craftiva_products";

export const uploadImage = async (file) => {
  if (!file) {
    throw new Error("Please select an image.");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "craftiva/products");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Image upload failed.");
  }

  return data.secure_url;
};