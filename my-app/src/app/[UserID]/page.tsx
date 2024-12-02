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
  updateFollowers,
} from "../firebase/firebaseDatabase";
import LoadingScreen from "../../components/LoadingScreen";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { MdAutoGraph } from "react-icons/md";

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

  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const auth = getAuth();

  const handleFollow = async () => {
    if (!auth.currentUser) return;

    try {
      const currentUserId = auth.currentUser.uid;
      const profileUserId = params.UserID;

      await updateFollowers(isFollowing, currentUserId, profileUserId);
      setIsFollowing(!isFollowing);
      setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        let userData = await fetchDocumentById("users", params.UserID);
        if (!userData && auth.currentUser?.uid === params.UserID) {
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

        const postsRef = collection(db, "posts");
        const postsQuery = query(postsRef, where("uid", "==", params.UserID));
        const postsSnapshot = await getDocs(postsQuery);
        const userPosts = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate().toLocaleString(),
        }));
        setPosts(userPosts);

        const followers = userData.followersCount || [];
        setFollowerCount(followers);

        console.log(followers);
        console.log(userData.usersFollowing);

        setIsFollowing(followers.includes(auth.currentUser.uid));
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.UserID) {
      fetchUserProfile();
    }
  }, [params.UserID]);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const postsRef = collection(db, "posts");
        const likedPostsQuery = query(
          postsRef,
          where("likedBy", "array-contains", params.UserID)
        );
        const likedPostsSnapshot = await getDocs(likedPostsQuery);
        const likedPostsData = likedPostsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate().toLocaleString(),
        }));
        setLikedPosts(likedPostsData);
      } catch (error) {
        console.error("Error fetching liked posts:", error);
      }
    };
    fetchLikedPosts();
  }, [params.UserID]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className={styles.app}>
        <Navbar />
        <div className={styles.mainContent}>
          <SidePanel />
          <div className={styles.notFound}>User not found</div>;
        </div>
      </div>
    );
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
                {auth.currentUser && auth.currentUser.uid !== params.UserID && (
                  <button
                    className={`${styles.followButton} ${
                      isFollowing ? styles.following : ""
                    }`}
                    onClick={handleFollow}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
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
                    <span className={styles.statNumber}>{followerCount}</span>
                    <span className={styles.statLabel}>Followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "posts" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "likes" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("likes")}
            >
              Liked Posts
            </button>
          </div>
          <div className={styles.postsContainer}>
            {activeTab === "posts"
              ? posts.map((post) => <Post key={post.id} {...post} />)
              : likedPosts.map((post) => <Post key={post.id} {...post} />)}
          </div>
        </main>
      </div>
    </div>
  );
}
