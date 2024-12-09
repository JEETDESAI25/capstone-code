"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import default_pfp from "./../../public/images/default_pfp.jpeg";
import styles from "../styles/ProfileImage.module.css";
import { signInWithGoogle, User } from "../app/firebase/firebaseAuth";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";
import { db, storage } from "../app/firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfileImage(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // Dropdown state
  const [username, setUsername] = useState<string>(""); // State for username
  const [bio, setBio] = useState<string>(""); // State for bio
  const [profilePicture, setProfilePicture] = useState<string | null>(null); // State for profile picture
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const currentUser: User = {
          displayName: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          profilePicture: firebaseUser.photoURL || default_pfp.src,
        };

        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // New user: show setup modal
          setShowSetupModal(true);
        } else {
          const userData = userDocSnap.data();
          currentUser.displayName = userData.username || "Anonymous";
          currentUser.profilePicture =
            userData.profilePicture || default_pfp.src;
        }

        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSetupSubmit = async (): Promise<void> => {
    if (!auth.currentUser) return;

    if (isSubmitting) return;

    if (!username.trim()) {
      alert("Please enter a username.");
      return;
    }

    if (!bio.trim()) {
      alert("Please enter a bio.");
      return;
    }

    if (!profilePicture) {
      alert("Please upload a profile picture.");
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedUsername = username.toLowerCase();

      // Check if username is taken
      const usersRef = collection(db, "users");
      const usernameQuery = query(
        usersRef,
        where("username", "==", normalizedUsername)
      );
      const querySnapshot = await getDocs(usernameQuery);

      if (!querySnapshot.empty) {
        alert("This username is already taken. Please choose another.");
        setIsSubmitting(false);
        return;
      }

      // Save user data to Firestore
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userData = {
        bio,
        displayName: normalizedUsername,
        email: auth.currentUser.email || "",
        followersCount: 0,
        followingCount: 0,
        profilePicture, // Store URL from Firebase Storage
        username: normalizedUsername,
        usersFollowing: [],
      };

      await setDoc(userDocRef, userData);
      setUser(userData as User);

      setShowSetupModal(false); // Close the modal
    } catch (error) {
      console.error("Error saving profile setup:", error);
      alert("An error occurred while saving your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];

    if (!file) {
      alert("Please select a valid image file.");
      return;
    }

    if (!auth.currentUser) {
      alert("You must be signed in to upload a profile picture.");
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const storageRef = ref(storage, `profilePictures/${userId}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setProfilePicture(downloadURL); // Save the download URL to state
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload profile picture. Please check your permissions.");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    router.push("/");
  };

  const handleProfileClick = async () => {
    if (!user) {
      // Trigger Google Sign-In
      try {
        const signedInUser = await signInWithGoogle();
        console.log("User signed in:", signedInUser);
        setUser(signedInUser);
      } catch (error) {
        console.error("Error during sign-in:", error);
        alert("Failed to sign in. Please try again.");
      }
    } else {
      // Toggle dropdown if already signed in
      toggleDropdown();
    }
  };

  const toggleDropdown = () => {
    if (!showSetupModal) {
      setShowDropdown((prev) => !prev);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <Image
        src={user?.profilePicture || default_pfp.src}
        alt="Profile"
        onClick={handleProfileClick}
        className={styles.profileImage}
        width={40}
        height={40}
      />
      {showDropdown && !showSetupModal && (
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
      {showSetupModal && (
        <div className={styles.setupModal}>
          <h2>Set Up Your Profile</h2>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.usernameInput}
          />
          <textarea
            placeholder="Enter your bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={styles.bioInput}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
          {profilePicture && (
            <Image
              src={profilePicture}
              alt="Selected Profile"
              className={styles.previewImage}
              width={100}
              height={100}
            />
          )}
          <button
            onClick={handleSetupSubmit}
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
