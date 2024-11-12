import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

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

export const fetchDocumentById = async (collection: string, id: string) => {
  try {
    const docRef = doc(db, collection, id); // Reference to the document
    const docSnapshot = await getDoc(docRef); // Fetch the document

    if (docSnapshot.exists()) {
      return { id: docSnapshot.id, ...docSnapshot.data() }; // Return the document data with the ID
    } else {
      console.log("Document not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error; // Propagate the error for handling
  }
};
