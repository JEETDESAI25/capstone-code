import styles from "../styles/Post.module.css";

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
        <h2>{username}</h2>
        <span className={styles.timestamp}>{timestamp}</span>
      </div>
      <p className={styles.content}>{content}</p>
      {imageUrl && (
        <img src={imageUrl} alt="Post image" className={styles.image} />
      )}
    </div>
  );
}
