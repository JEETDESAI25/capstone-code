import Link from "next/link";
import styles from "../styles/Post.module.css";
import Image from "next/image";
import default_pfp from "./../../public/images/default_pfp.jpeg";
import { useState, useEffect } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { getAuth } from "firebase/auth";
import {
  fetchUserDataById,
  likePost,
  unlikePost,
  deletePostAndImage,
} from "../app/firebase/firebaseDatabase";

interface PostProps {
  id?: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  userId?: string;
  likes?: number[];
  likedBy?: string[];
  onDelete?: (id: string) => void; // New prop to handle deletion in the parent component
}

export default function Post({
  id,
  content,
  imageUrl,
  timestamp,
  userId,
  likes = [],
  likedBy = [],
  onDelete, // Add onDelete to destructured props
}: PostProps) {
  const auth = getAuth();
  const isOwner = userId ? auth.currentUser?.uid === userId : false;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes.length);
  const [dbUsername, setDbUsername] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string>(default_pfp.src);
  const [relativeTime, setRelativeTime] = useState<string>("");

  useEffect(() => {
    if (auth.currentUser) {
      setIsLiked(likedBy.includes(auth.currentUser.uid));
    }
  }, [likedBy]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const userDoc = await fetchUserDataById(userId);
          if (userDoc) {
            setDbUsername(userDoc.username || "Unknown User");
            setProfilePic(userDoc.profilePicture || default_pfp);
          }
        } catch (error) {
          console.error("Error fetching user data for post:", error);
        }
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const calculateRelativeTime = () => {
      const postTime = new Date(timestamp);
      const currentTime = new Date();
      const differenceInSeconds = Math.floor(
        (currentTime.getTime() - postTime.getTime()) / 1000
      );

      if (differenceInSeconds < 60) {
        setRelativeTime("just now");
      } else if (differenceInSeconds < 3600) {
        setRelativeTime(`${Math.floor(differenceInSeconds / 60)}m ago`);
      } else if (differenceInSeconds < 86400) {
        setRelativeTime(`${Math.floor(differenceInSeconds / 3600)}h ago`);
      } else {
        setRelativeTime(`${Math.floor(differenceInSeconds / 86400)}d ago`);
      }
    };

    calculateRelativeTime();
    const interval = setInterval(calculateRelativeTime, 60000);
    return () => clearInterval(interval);
  }, [timestamp]);

  const handleLike = async () => {
    if (!auth.currentUser || !id) return;

    try {
      const currentUserId = auth.currentUser.uid;
      if (isLiked) {
        await unlikePost(id, currentUserId);
        setLikeCount((prev) => prev - 1);
      } else {
        await likePost(id, currentUserId);
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleDelete = async () => {
    if (!isOwner || !id) return;

    // Display confirmation popup
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!isConfirmed) {
      return; // Cancel deletion if user clicks "No"
    }

    try {
      await deletePostAndImage(id, imageUrl);
      if (onDelete) {
        onDelete(id); // Notify the parent component to update its state
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className={styles.post}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <Link href={`/${userId}`}>
            <Image
              src={profilePic}
              alt="Profile"
              className={styles.profilePic}
              width={40}
              height={40}
            />
          </Link>
          <span className={styles.username}>{dbUsername}</span>
          <span className={styles.timestamp}>{relativeTime}</span>
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
