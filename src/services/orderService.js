import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

const ordersCollection = collection(db, "orders");

// ADMIN: Subscribe to all orders
export const subscribeToOrders = (callback, onError) => {
  const ordersQuery = query(
    ordersCollection,
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const orders = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      callback(orders);
    },
    (error) => {
      if (onError) onError(error);
      else console.error("Orders subscription error:", error);
    }
  );
};

// CUSTOMER: Subscribe only to their own orders
export const subscribeToUserOrders = (userId, callback, onError) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const userOrdersQuery = query(
    ordersCollection,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    userOrdersQuery,
    (snapshot) => {
      const orders = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      callback(orders);
    },
    (error) => {
      console.error("Customer orders subscription error:", error);
      if (onError) onError(error);
    }
  );
};

// CREATE CUSTOMER ORDER
export const createOrder = async (orderData) => {
  const orderRef = await addDoc(ordersCollection, {
    ...orderData,
    status: "Pending",
    paymentStatus: "Pending Verification",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return orderRef.id;
};

// ADMIN: Update order status
export const updateOrderStatus = async (id, status) => {
  const orderRef = doc(db, "orders", id);

  return updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

// ADMIN: Update payment status
export const updatePaymentStatus = async (id, paymentStatus) => {
  const orderRef = doc(db, "orders", id);

  return updateDoc(orderRef, {
    paymentStatus,
    updatedAt: serverTimestamp(),
  });
};