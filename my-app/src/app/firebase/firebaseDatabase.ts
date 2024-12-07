import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  arrayRemove,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "./firebaseConfig";

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

export const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const fetchUserPosts = async (userId: string) => {
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: formatTimestamp(doc.data().timestamp),
    }));
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
};

export const fetchUserLikedPosts = async (userId: string) => {
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("likedBy", "array-contains", userId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: formatTimestamp(doc.data().timestamp),
    }));
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return [];
  }
};

export const updateFollowers = async (
  isFollowing: boolean,
  currentUserId: string,
  profileUserId: string
) => {
  const profileDocRef = doc(db, "users", profileUserId);

  if (isFollowing) {
    await updateDoc(profileDocRef, {
      followers: arrayRemove(currentUserId),
    });
  } else {
    await updateDoc(profileDocRef, {
      followers: arrayUnion(currentUserId),
    });
  }
};

export const fetchUserDataById = async (userId: string) => {
  const userDocRef = doc(db, "users", userId); // Reference to the user document
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? userDoc.data() : null;
};

// Like a post
export const likePost = async (postId: string, userId: string) => {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    likes: arrayUnion(userId),
  });
};

// Unlike a post
export const unlikePost = async (postId: string, userId: string) => {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    likes: arrayRemove(userId),
  });
};

// Delete a post and its image
export const deletePostAndImage = async (postId: string, imageUrl: string) => {
  if (postId) {
    await deleteDoc(doc(db, "posts", postId));
  }

  if (imageUrl) {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  }
};
