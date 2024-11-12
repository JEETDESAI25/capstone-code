"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image, { StaticImageData } from "next/image";
import default_pfp from "./../../public/images/default_pfp.jpeg";
import styles from "../styles/ProfileImage.module.css";
import { signInWithGoogle, User } from "../app/firebase/firebaseAuth";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export default function ProfileImage(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const currentUser: User = {
          displayName: firebaseUser.displayName || "Anonymous",
          email: firebaseUser.email || "",
          profilePicture: firebaseUser.photoURL || "",
        };
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleProfileClick = (): void => {
    if (user) {
      setShowDropdown((prev) => !prev);
    } else {
      handleSignIn();
    }
  };

  const handleSignIn = async (): Promise<void> => {
    try {
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setShowDropdown(false);
      router.push("/");
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <Image
        src={user?.profilePicture || (default_pfp as StaticImageData)}
        alt="Profile"
        onClick={handleProfileClick}
        className={styles.profileImage}
        width={40}
        height={40}
      />
      {showDropdown && (
        <div className={styles.dropdownMenu}>
          <button
            onClick={() => router.push(`/${auth.currentUser?.uid}`)}
            className={styles.dropdownButton}
          >
            View Profile
          </button>
          <button onClick={handleSignOut} className={styles.signoutButton}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
