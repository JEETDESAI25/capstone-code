import styles from "../styles/Post.module.css";
import Image from "next/image";
import default_pfp from "./../../public/images/default_pfp.jpeg";
import { getAuth } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../app/firebase/firebaseConfig";

interface PostProps {
  id: string;
  username: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  userId: string;
}

export default function Post({
  id,
  username,
  content,
  imageUrl,
  timestamp,
  userId,
}: PostProps) {
  const auth = getAuth();
  const isOwner = auth.currentUser?.uid === userId;

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
        </div>
        <div className={styles.postActions}>
          <span className={styles.timestamp}>{timestamp}</span>
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
