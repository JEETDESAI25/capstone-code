"use client";

import { useState, useEffect } from "react";
import styles from "../../styles/App.module.css";
import Navbar from "../../components/Navbar";
import SidePanel from "../../components/Sidepanel";
import Post from "../../components/Post";
import default_pfp from "./../../../public/images/default_pfp.jpeg";
import Image from "next/image";
import {
  fetchDocumentById,
  createUserDocument,
} from "../firebase/firebaseDatabase";
import LoadingScreen from "../../components/LoadingScreen";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function ProfileDetails({
  params,
}: {
  params: {
    UserID: string;
  };
}) {
  const [user, setUser] = useState<{
    username: string;
    bio: string;
    profilePicture: string;
    email?: string;
  } | null>(null);
  const [posts, setPosts] = useState<
    Array<{
      id: string;
      content: string;
      timestamp: string;
      imageUrl?: string;
      username: string;
      userId: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Check if user exists in database
        let userData = await fetchDocumentById("users", params.UserID);

        // If user doesn't exist in database but is authenticated, create user document
        if (
          !userData &&
          auth.currentUser &&
          auth.currentUser.uid === params.UserID
        ) {
          const newUserData = {
            username: auth.currentUser.displayName || "Anonymous",
            email: auth.currentUser.email,
            profilePicture: auth.currentUser.photoURL || default_pfp,
            bio: "",
          };
          await createUserDocument(params.UserID, newUserData);
          userData = newUserData;
        }

        if (userData) {
          setUser({
            username: userData.username || "Anonymous",
            bio: userData.bio || "",
            profilePicture: userData.profilePicture || default_pfp,
            email: userData.email,
          });
        }

        // Fetch user's posts
        const postsRef = collection(db, "posts");
        const q = query(
          postsRef,
          where("uid", "==", params.UserID),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const userPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate().toLocaleString(),
          userId: doc.data().uid,
        }));

        setPosts(userPosts);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.UserID) {
      fetchUserProfile();
    }
  }, [params.UserID, auth.currentUser]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <div className={styles.notFound}>User not found</div>;
  }

  return (
    <div className={styles.app}>
      <Navbar />
      <div className={styles.mainContent}>
        <SidePanel />
        <main className={styles.content}>
          <div className={styles.profileHeader}>
            <div className={styles.profileInfo}>
              <Image
                src={user.profilePicture}
                alt="Profile"
                width={150}
                height={150}
                className={styles.profileImage}
                unoptimized
              />
              <div className={styles.userDetails}>
                <h2 className={styles.username}>{user.username}</h2>
                <p className={styles.email}>
                  {user.email || "No email provided"}
                </p>
                <p className={styles.bio}>{user.bio || "No bio yet"}</p>
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>{posts.length}</span>
                    <span className={styles.statLabel}>Posts</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>0</span>
                    <span className={styles.statLabel}>Following</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>0</span>
                    <span className={styles.statLabel}>Followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.postsSection}>
            <h3 className={styles.sectionTitle}>Posts</h3>
            <div className={styles.postsContainer}>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Post
                    key={post.id}
                    id={post.id}
                    username={post.username}
                    content={post.content}
                    imageUrl={post.imageUrl}
                    timestamp={post.timestamp}
                    userId={post.userId}
                  />
                ))
              ) : (
                <div className={styles.noPosts}>
                  <p>No posts yet</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
