"use client";

import { useState, useEffect } from "react";
import styles from "../styles/App.module.css";
import Navbar from "../components/Navbar";
import SidePanel from "../components/Sidepanel";
import Post from "../components/Post";
import CreatePost from "../components/CreatePost";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate().toLocaleString(),
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={`${styles.app} ${styles.root}`}>
      <Navbar />
      <div className={styles.mainContent}>
        <SidePanel />
        <div className={styles.content}>
          <div className={styles.filters}>
            <h1 className={styles.filter}>Home</h1>
            <h1 className={styles.filter}>Following</h1>
            <h1 className={styles.filter}>For You</h1>
          </div>
          <CreatePost />
          <div className={styles.postsContainer}>
            {posts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                username={post.username}
                content={post.content}
                imageUrl={post.imageUrl}
                timestamp={post.timestamp}
                userId={post.uid}
              />
            ))}
            <Post
              username="social_justice_warrior"
              content="Lorem ipsum odor amet, consectetuer adipiscing elit. Eros himenaeos sed  netus sagittis maecenas commodo suspendisse fringilla aenean. Est  efficitur tempus tristique facilisi consequat tristique. Netus dictum  praesent sed magnis ut integer nibh. Mauris fames molestie habitasse,  facilisi lectus senectus. Magnis blandit varius neque eros sapien  lacinia."
              imageUrl="/images/black-lives-matter.jpg"
              timestamp="2h ago"
            />
            <Post
              username="social_justice_warrior"
              content="Lorem ipsum odor amet, consectetuer adipiscing elit. Eros himenaeos sed  netus sagittis maecenas commodo suspendisse fringilla aenean. Est  efficitur tempus tristique facilisi consequat tristique. Netus dictum  praesent sed magnis ut integer nibh. Mauris fames molestie habitasse,  facilisi lectus senectus. Magnis blandit varius neque eros sapien  lacinia."
              imageUrl="/images/black-lives-matter.jpg"
              timestamp="2h ago"
            />
            <Post
              username="Hi@climate-change"
              content="Lorem ipsum odor amet, consectetuer adipiscing elit. Eros himenaeos sed  netus sagittis maecenas commodo suspendisse fringilla aenean. Est  efficitur tempus tristique facilisi consequat tristique. Netus dictum  praesent sed magnis ut integer nibh. Mauris fames molestie habitasse,  facilisi lectus senectus. Magnis blandit varius neque eros sapien  lacinia."
              imageUrl="/images/climate-justice.jpg"
              timestamp="2h ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
