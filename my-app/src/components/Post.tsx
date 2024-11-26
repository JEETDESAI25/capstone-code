import styles from "../styles/Post.module.css";
import Image from "next/image";
import default_pfp from "./../../public/images/default_pfp.jpeg";
import { getAuth } from "firebase/auth";
import {
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../app/firebase/firebaseConfig";
import { useState, useEffect } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

interface PostProps {
  id?: string;
  username: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  userId?: string;
  likes?: number;
  likedBy?: string[];
}

export default function Post({
  id,
  username,
  content,
  imageUrl,
  timestamp,
  userId,
  likes = 0,
  likedBy = [],
}: PostProps) {
  const auth = getAuth();
  const isOwner = userId ? auth.currentUser?.uid === userId : false;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  useEffect(() => {
    if (auth.currentUser) {
      setIsLiked(likedBy.includes(auth.currentUser.uid));
    }
  }, [likedBy]);

  const handleDelete = async () => {
    if (!isOwner) return;

    try {
      // Delete the post document
      await deleteDoc(doc(db, "posts", id));

      // Delete the image if it exists
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleLike = async () => {
    if (!auth.currentUser || !id) {
      // If it's a dummy post or user is not logged in
      return;
    }

    const postRef = doc(db, "posts", id);
    const userId = auth.currentUser.uid;

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: likeCount - 1,
          likedBy: arrayRemove(userId),
        });
        setLikeCount((prev) => prev - 1);
      } else {
        await updateDoc(postRef, {
          likes: likeCount + 1,
          likedBy: arrayUnion(userId),
        });
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  return (
    <div className={styles.post}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <Image
            src={default_pfp}
            alt="Profile"
            className={styles.profilePic}
            width={40}
            height={40}
          />
          <span className={styles.username}>{username}</span>
          <span className={styles.timestamp}>{timestamp}</span>
        </div>
        <div className={styles.postActions}>
          <button onClick={handleLike} className={styles.likeButton}>
            {isLiked ? (
              <AiFillHeart className={styles.likedHeart} />
            ) : (
              <AiOutlineHeart />
            )}
            <span>{likeCount}</span>
          </button>
          {isOwner && (
            <button onClick={handleDelete} className={styles.deleteButton}>
              Delete
            </button>
          )}
        </div>
      </div>
      <p className={styles.content}>{content}</p>
      {imageUrl && (
        <div className={styles.imageContainer}>
          <Image
            src={imageUrl}
            alt="Post image"
            width={800}
            height={400}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "600px",
              objectFit: "contain",
            }}
            priority
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
