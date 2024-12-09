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
  addDoc,
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
export const likePost = async (
  campaignId: string,
  postId: string,
  userId: string
) => {
  const postRef = doc(db, "campaigns", campaignId, "posts", postId);
  const postDoc = await getDoc(postRef);

  if (postDoc.exists()) {
    const likes = postDoc.data().likes || [];
    const newLikes = likes.includes(userId)
      ? likes.filter((id: string) => id !== userId)
      : [...likes, userId];

    await updateDoc(postRef, { likes: newLikes });
  }
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
// Add these functions to your existing firebaseDatabase.ts

export const createCampaign = async (campaignData: {
  title: string;
  description: string;
  category: string;
  creatorId: string;
}) => {
  try {
    const campaignRef = collection(db, "campaigns");
    const newCampaign = {
      ...campaignData,
      createdAt: new Date().toISOString(),
      members: [campaignData.creatorId],
    };

    const docRef = await addDoc(campaignRef, newCampaign);
    return { id: docRef.id, ...newCampaign };
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
};

export const fetchCampaigns = async () => {
  try {
    const campaignsRef = collection(db, "campaigns");
    const q = query(campaignsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
};

export const joinCampaign = async (campaignId: string, userId: string) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    await updateDoc(campaignRef, {
      members: arrayUnion(userId),
    });
    return true;
  } catch (error) {
    console.error("Error joining campaign:", error);
    throw error;
  }
};

export const createCampaignChat = async (
  campaignId: string,
  message: string,
  userId: string
) => {
  try {
    const chatRef = collection(db, "campaigns", campaignId, "chats");
    await addDoc(chatRef, {
      message,
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating chat message:", error);
    throw error;
  }
};

export const fetchCampaignChats = async (campaignId: string) => {
  try {
    const chatsRef = collection(db, "campaigns", campaignId, "chats");
    const q = query(chatsRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
};

export const deleteCampaign = async (campaignId: string, userId: string) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists() || campaignDoc.data().creatorId !== userId) {
      throw new Error("Unauthorized to delete this campaign");
    }

    await deleteDoc(campaignRef);
    return true;
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
};

export const createCampaignPost = async (
  campaignId: string,
  postData: {
    content: string;
    userId: string;
    imageUrl?: string;
  }
) => {
  try {
    const postsRef = collection(db, "campaigns", campaignId, "posts");
    const newPost = {
      ...postData,
      createdAt: new Date().toISOString(),
      likes: [],
    };

    await addDoc(postsRef, newPost);
    return newPost;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const fetchCampaignPosts = async (campaignId: string) => {
  try {
    const postsRef = collection(db, "campaigns", campaignId, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const addMemberByUsername = async (
  campaignId: string,
  username: string
) => {
  try {
    // First find the user by username
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("User not found");
    }

    const userId = querySnapshot.docs[0].id;

    // Add user to campaign members
    const campaignRef = doc(db, "campaigns", campaignId);
    await updateDoc(campaignRef, {
      members: arrayUnion(userId),
    });

    return true;
  } catch (error) {
    console.error("Error adding member:", error);
    throw error;
  }
};

export const addComment = async (
  campaignId: string,
  postId: string,
  comment: { content: string; userId: string }
) => {
  const postRef = doc(db, "campaigns", campaignId, "posts", postId);
  const newComment = {
    id: uuidv4(),
    ...comment,
    createdAt: new Date().toISOString(),
  };

  await updateDoc(postRef, {
    comments: arrayUnion(newComment),
  });
};

interface Campaign {
  id: string;
  createdAt: string;
  title: string;
  description: string;
  category: string;
  creatorId: string;
  members: string[];
}

export const fetchUserCampaigns = async (
  userId: string
): Promise<Campaign[]> => {
  try {
    const campaignsRef = collection(db, "campaigns");
    const q = query(campaignsRef, where("members", "array-contains", userId));

    const querySnapshot = await getDocs(q);
    const campaigns = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Campaign[];

    return campaigns.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error fetching user campaigns:", error);
    return [];
  }
};

function uuidv4() {
  throw new Error("Function not implemented.");
}
