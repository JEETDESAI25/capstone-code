import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const db = getFirestore();

// Check if a user document exists
export const userExists = async (uid: string): Promise<boolean> => {
  const userRef = doc(db, "users", uid);
  const docSnapshot = await getDoc(userRef);
  return docSnapshot.exists();
};

// Create or update a user document in the "users" collection
export const createUserDocument = async (
  uid: string,
  userData: Record<string, any>
) => {
  try {
    const userRef = doc(db, "users", uid); // Reference to the user's document
    await setDoc(userRef, userData, { merge: true }); // Merge existing data
    console.log(`User document created/updated for UID: ${uid}`);
  } catch (error) {
    console.error("Error creating or updating user document:", error);
  }
};
