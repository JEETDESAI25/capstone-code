import Link from "next/link";
import styles from "../styles/Post.module.css";
import Image from "next/image";
import default_pfp from "./../../public/images/default_pfp.jpeg";
import { useState, useEffect } from "react";
import { AiOutlineHeart, AiFillHeart, AiOutlineComment } from "react-icons/ai";
import { getAuth } from "firebase/auth";
import {
  fetchUserDataById,
  likePost,
  unlikePost,
  deletePostAndImage,
  addComment,
} from "../app/firebase/firebaseDatabase";

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  username?: string;
  profilePicture?: string;
}

interface PostProps {
  id?: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  userId?: string;
  likes?: string[];
  likedBy?: string[];
  username?: string;
  onDelete?: (id: string) => void;
  comments?: Comment[];
}

export default function Post({
  id,
  content,
  imageUrl,
  timestamp,
  userId,
  username,
  likes = [],
  likedBy = [],
  onDelete,
  comments = [],
}: PostProps) {
  const auth = getAuth();
  const isOwner = userId ? auth.currentUser?.uid === userId : false;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes.length);
  const [dbUsername, setDbUsername] = useState<string>(
    username || "Unknown User"
  );
  const [profilePic, setProfilePic] = useState<string>(default_pfp.src);
  const [relativeTime, setRelativeTime] = useState<string>("");
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postComments, setPostComments] = useState<Comment[]>(comments);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting comment with:", {
      auth: !!auth.currentUser,
      id,
      newComment,
    });

    if (!auth.currentUser || !id || !newComment.trim()) {
      console.log("Missing required data:", {
        auth: !!auth.currentUser,
        id,
        newComment: !!newComment.trim(),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const comment = {
        content: newComment.trim(),
        userId: auth.currentUser.uid,
      };

      console.log("Adding comment:", comment);
      const addedComment = await addComment(id, comment);
      console.log("Comment added successfully:", addedComment);

      // Fetch user data for the new comment
      const userData = await fetchUserDataById(auth.currentUser.uid);

      // Add the new comment to the local state
      const newCommentObj: Comment = {
        ...addedComment,
        username: userData?.username || "Unknown User",
        profilePicture: userData?.profilePicture || default_pfp.src,
      };

      setPostComments((prev) => [...prev, newCommentObj]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <button
            onClick={() => setShowComments(!showComments)}
            className={styles.commentButton}
          >
            <AiOutlineComment />
            <span>{postComments.length}</span>
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

      {showComments && (
        <div className={styles.commentsSection}>
          <form onSubmit={handleAddComment} className={styles.commentForm}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className={styles.commentInput}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              className={styles.commentSubmit}
              disabled={isSubmitting || !newComment.trim()}
            >
              Post
            </button>
          </form>

          <div className={styles.commentsList}>
            {postComments.map((comment) => (
              <div key={comment.id} className={styles.commentItem}>
                <Link href={`/${comment.userId}`}>
                  <Image
                    src={comment.profilePicture || default_pfp.src}
                    alt="Profile"
                    className={styles.commentProfilePic}
                    width={24}
                    height={24}
                  />
                </Link>
                <div className={styles.commentContent}>
                  <span className={styles.commentUsername}>
                    {comment.username || "Unknown User"}
                  </span>
                  <p className={styles.commentText}>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
