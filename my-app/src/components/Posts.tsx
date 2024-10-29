import styles from "../styles/Posts.module.css";
import Image from "next/image";
import default_pfp from "./../../public/images/default_pfp.jpeg";

interface PostProps {
  username: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
}

export default function Post({
  username,
  content,
  imageUrl,
  timestamp,
}: PostProps) {
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
        <span className={styles.timestamp}>{timestamp}</span>
      </div>
      <p className={styles.content}>{content}</p>
      {imageUrl && (
        <div style={{ position: "relative", width: "100%", height: "300px" }}>
          <Image
            src={imageUrl}
            alt="Post image"
            className={styles.image}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
    </div>
  );
}
