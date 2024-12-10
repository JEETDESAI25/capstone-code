"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import styles from "../../styles/App.module.css";
import Navbar from "../../components/Navbar";
import SidePanel from "../../components/Sidepanel";
import Post from "../../components/Post";
import LoadingScreen from "../../components/LoadingScreen";

export default function PopularPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        const postsRef = collection(db, "posts");
        // First get all posts
        const q = query(postsRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        // Transform the data and include the likes count
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate().toISOString(),
          likesCount: (doc.data().likedBy || []).length,
        }));

        // Sort by likes count in descending order
        const sortedPosts = postsData.sort(
          (a, b) => b.likesCount - a.likesCount
        );

        setPosts(sortedPosts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching popular posts:", error);
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`${styles.app} ${styles.root}`}>
      <Navbar />
      <div className={styles.mainContent}>
        <SidePanel />
        <div className={styles.content}>
          <h1 className={styles.sectionTitle}>Popular Posts</h1>
          <div className={styles.postsContainer}>
            {posts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                content={post.content}
                imageUrl={post.imageUrl}
                timestamp={post.timestamp}
                userId={post.uid}
                likes={post.likes}
                likedBy={post.likedBy}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
