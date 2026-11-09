import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

const productsCollection = collection(db, "products");

// Get products in real time
export const subscribeToProducts = (callback) => {
  return onSnapshot(productsCollection, (snapshot) => {
    const products = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    callback(products);
  });
};

// Add product
export const addProduct = async (productData) => {
  return await addDoc(productsCollection, {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update product
export const updateProduct = async (id, productData) => {
  const productRef = doc(db, "products", id);

  return await updateDoc(productRef, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
};

// Delete product
export const deleteProduct = async (id) => {
  const productRef = doc(db, "products", id);

  return await deleteDoc(productRef);
};