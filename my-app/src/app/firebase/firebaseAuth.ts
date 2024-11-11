import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebaseConfig"; // Import the initialized Firebase Auth instance

// Define the User type to keep our app consistent
export interface User {
  displayName: string;
  email: string;
  profilePicture: string;
}

// Function to handle Google Sign-In
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser: FirebaseUser = result.user;

    // Transform FirebaseUser into our app's User format
    return {
      displayName: firebaseUser.displayName || "Anonymous",
      email: firebaseUser.email || "",
      profilePicture: firebaseUser.photoURL || "", // Ensure photoURL is returned
    };
  } catch (error) {
    console.error("Error during sign-in:", error);
    throw error; // Propagate the error to the caller
  }
};
