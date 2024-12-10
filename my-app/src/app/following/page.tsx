"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import styles from "../../styles/App.module.css";
import followingStyles from "../../styles/Following.module.css";
import Navbar from "../../components/Navbar";
import SidePanel from "../../components/Sidepanel";
import LoadingScreen from "../../components/LoadingScreen";
import Image from "next/image";
import Link from "next/link";
import { fetchDocumentById } from "../firebase/firebaseDatabase";
import default_pfp from "../../../public/images/default_pfp.jpeg";

interface FollowingUser {
  id: string;
  username: string;
  profilePicture: string;
  bio: string;
}

export default function Following() {
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const currentUserData = await fetchDocumentById(
          "users",
          auth.currentUser.uid
        );
        const followingIds = currentUserData?.following || [];

        if (followingIds.length === 0) {
          setFollowing([]);
          setLoading(false);
          return;
        }

        const followingUsers = await Promise.all(
          followingIds.map(async (userId: string) => {
            const userData = await fetchDocumentById("users", userId);
            return {
              id: userId,
              username: userData?.username || "Anonymous",
              profilePicture: userData?.profilePicture || default_pfp.src,
              bio: userData?.bio || "No bio yet",
            };
          })
        );

        setFollowing(followingUsers);
      } catch (error) {
        console.error("Error fetching following:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [auth.currentUser]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!auth.currentUser) {
    return (
      <div className={styles.app}>
        <Navbar />
        <div className={styles.mainContent}>
          <SidePanel />
          <main className={styles.content}>
            <div className={followingStyles.notSignedIn}>
              Please sign in to see who you are following
            </div>
          </main>
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
          <h1 className={followingStyles.title}>Following</h1>
          <div className={followingStyles.followingGrid}>
            {following.length === 0 ? (
              <div className={followingStyles.noFollowing}>
                You are not following anyone yet
              </div>
            ) : (
              following.map((user) => (
                <Link
                  href={`/${user.id}`}
                  key={user.id}
                  className={followingStyles.userCard}
                >
                  <Image
                    src={user.profilePicture}
                    alt={user.username}
                    width={80}
                    height={80}
                    className={followingStyles.profileImage}
                    unoptimized
                  />
                  <div className={followingStyles.userInfo}>
                    <h2 className={followingStyles.username}>
                      {user.username}
                    </h2>
                    <p className={followingStyles.bio}>{user.bio}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
