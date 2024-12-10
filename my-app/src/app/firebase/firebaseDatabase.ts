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
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "./firebaseConfig";
import { v4 as uuidv4 } from "uuid";

interface Post {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
  imageUrl?: string;
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface UserDocument {
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  followers: string[];
  following: string[];
  uid: string;
}

// Check if a user document exists
export const userExists = async (uid: string): Promise<boolean> => {
  const userRef = doc(db, "users", uid);
  const docSnapshot = await getDoc(userRef);
  return docSnapshot.exists();
};

// Create or update a user document in the "users" collection
export const createUserDocument = async (
  uid: string,
  userData: Partial<UserDocument>
) => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, userData, { merge: true });
    console.log(`User document created/updated for UID: ${uid}`);
  } catch (error) {
    console.error("Error creating or updating user document:", error);
  }
};

export const fetchDocumentById = async (
  collection: string,
  id: string
): Promise<UserDocument | null> => {
  try {
    const docRef = doc(db, collection, id);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      return { id: docSnapshot.id, ...docSnapshot.data() } as UserDocument;
    } else {
      console.log("Document not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};

export const formatTimestamp = (
  timestamp: {
    toDate: () => Date;
  } | null
) => {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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
  const currentUserDocRef = doc(db, "users", currentUserId);

  try {
    if (isFollowing) {
      // Remove from followers and following
      await updateDoc(profileDocRef, {
        followers: arrayRemove(currentUserId),
      });
      await updateDoc(currentUserDocRef, {
        following: arrayRemove(profileUserId),
      });
    } else {
      // Add to followers and following
      await updateDoc(profileDocRef, {
        followers: arrayUnion(currentUserId),
      });
      await updateDoc(currentUserDocRef, {
        following: arrayUnion(profileUserId),
      });
    }
  } catch (error) {
    console.error("Error updating follow status:", error);
    throw error;
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
    imageFile?: File | null;
  }
) => {
  try {
    console.log("Starting post creation for campaign:", campaignId);
    const postsRef = collection(db, "campaigns", campaignId, "posts");
    const { imageFile, ...postDataWithoutFile } = postData;
    let uploadedImageUrl: string | undefined;

    if (imageFile) {
      console.log("Starting image upload...", {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type,
      });

      // Create a unique file name to prevent collisions
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${imageFile.name.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      )}`;

      const storageRef = ref(
        storage,
        `campaigns/${campaignId}/posts/${uniqueFileName}`
      );

      try {
        // Upload the image
        const uploadResult = await uploadBytes(storageRef, imageFile);
        console.log("Image upload response:", uploadResult);

        // Get the download URL
        uploadedImageUrl = await getDownloadURL(uploadResult.ref);
        console.log("Image URL obtained:", uploadedImageUrl);
      } catch (uploadError) {
        console.error("Error during image upload:", uploadError);
        throw new Error("Failed to upload image. Please try again.");
      }
    }

    // Prepare the post data
    const newPost = {
      ...postDataWithoutFile,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      ...(uploadedImageUrl ? { imageUrl: uploadedImageUrl } : {}),
    };

    console.log("Creating new post with data:", newPost);
    const docRef = await addDoc(postsRef, newPost);
    console.log("Post created successfully with ID:", docRef.id);

    return { id: docRef.id, ...newPost };
  } catch (error) {
    console.error("Detailed error in createCampaignPost:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to create post: ${error.message}`);
    } else {
      throw new Error("Failed to create post: Unknown error occurred");
    }
  }
};

export const fetchCampaignPosts = async (
  campaignId: string
): Promise<Post[]> => {
  try {
    const postsRef = collection(db, "campaigns", campaignId, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const posts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Post, "id">),
    }));

    return posts.map((post) => ({
      id: post.id,
      content: post.content || "",
      userId: post.userId || "",
      createdAt: post.createdAt || "",
      likes: post.likes || [],
      comments: post.comments || [],
      imageUrl: post.imageUrl,
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

export const getUsernameById = async (userId: string) => {
  try {
    const userDoc = await fetchDocumentById("users", userId);
    return userDoc?.username || userId; // Fallback to ID if username not found
  } catch (error) {
    console.error("Error fetching username:", error);
    return userId; // Fallback to ID on error
  }
};
