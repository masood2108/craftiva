import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";

const paymentSettingsRef = doc(db, "storeSettings", "payment");

export const subscribeToPaymentSettings = (callback, onError) => {
  return onSnapshot(
    paymentSettingsRef,
    (snapshot) => {
      callback(
        snapshot.exists()
          ? snapshot.data()
          : { upiId: "", payeeName: "CRAFTIVA" }
      );
    },
    onError
  );
};

export const getPaymentSettings = async () => {
  const snapshot = await getDoc(paymentSettingsRef);

  return snapshot.exists()
    ? snapshot.data()
    : { upiId: "", payeeName: "CRAFTIVA" };
};

export const savePaymentSettings = async (settings) => {
  const upiId = settings.upiId?.trim();
  const payeeName = settings.payeeName?.trim();

  if (!upiId || !payeeName) {
    throw new Error("Enter UPI ID and payee name");
  }

  await setDoc(
    paymentSettingsRef,
    {
      upiId,
      payeeName,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};