"use client";

import { useState, useEffect } from "react";
import styles from "../styles/App.module.css";
import Navbar from "../components/Navbar";
import SidePanel from "../components/Sidepanel";
import Post from "../components/Post";
import CreatePost from "../components/CreatePost";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase/firebaseConfig";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const auth = getAuth();

  useEffect(() => {
    // Fetch all posts for the "Home" tab
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate().toISOString(),
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch posts by users the current user is following
    const fetchFollowingPosts = async () => {
      if (!auth.currentUser) return;

      try {
        const userRef = collection(db, "users");
        const userDoc = await getDocs(
          query(userRef, where("uid", "==", auth.currentUser.uid))
        );

        if (!userDoc.empty) {
          const currentUser = userDoc.docs[0].data();
          const followingIds = currentUser.following || [];

          const postsRef = collection(db, "posts");
          const followingQuery = query(
            postsRef,
            where("uid", "in", followingIds)
          );
          const querySnapshot = await getDocs(followingQuery);

          const followingPostsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate().toISOString(),
          }));
          setFollowingPosts(followingPostsData);
        }
      } catch (error) {
        console.error("Error fetching following posts:", error);
      }
    };

    fetchFollowingPosts();
  }, [auth.currentUser]);

  const handlePostDelete = (postId: string) => {
    if (activeTab === "home") {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } else if (activeTab === "following") {
      setFollowingPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postId)
      );
    }
  };

  return (
    <div className={`${styles.app} ${styles.root}`}>
      <Navbar />
      <div className={styles.mainContent}>
        <SidePanel />
        <div className={styles.content}>
          <div className={styles.filters}>
            <h1
              className={`${styles.tabButton} ${
                activeTab === "home" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("home")}
            >
              Home
            </h1>
            <h1
              className={`${styles.tabButton} ${
                activeTab === "following" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("following")}
            >
              Following
            </h1>
            <h1 className={styles.tabButton}>For You</h1>
          </div>
          <CreatePost />
          <div className={styles.postsContainer}>
            {(activeTab === "home" ? posts : followingPosts).map((post) => (
              <Post
                key={post.id}
                id={post.id}
                content={post.content}
                imageUrl={post.imageUrl}
                timestamp={post.timestamp}
                userId={post.uid}
                likes={post.likes}
                likedBy={post.likedBy}
                onDelete={handlePostDelete}
              />
            ))}
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
            <Post
              username="social_justice_warrior"
              content="Lorem ipsum odor amet, consectetuer adipiscing elit. Eros himenaeos sed  netus sagittis maecenas commodo suspendisse fringilla aenean. Est  efficitur tempus tristique facilisi consequat tristique. Netus dictum  praesent sed magnis ut integer nibh. Mauris fames molestie habitasse,  facilisi lectus senectus. Magnis blandit varius neque eros sapien  lacinia."
              imageUrl="/images/black-lives-matter.jpg"
              timestamp="2h ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
