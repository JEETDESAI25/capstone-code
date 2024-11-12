"use client";

import React, { useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import default_pfp from "./../../public/images/default_pfp.jpeg"; // Default profile picture
import styles from "../styles/ProfileImage.module.css"; // Component styles
import { signInWithGoogle, User } from "../app/firebase/firebaseAuth"; // Import sign-in logic
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  createUserDocument,
  userExists,
} from "../app/firebase/firebaseDatabase"; // Import database logic

export default function ProfileImage(): JSX.Element {
  const [user, setUser] = useState<User | null>(null); // State for the signed-in user
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // State to toggle dropdown visibility
  const [showNewUserPopup, setShowNewUserPopup] = useState<boolean>(false); // State to show new user popup
  const [bio, setBio] = useState<string>(""); // New user bio
  const [username, setUsername] = useState<string>(""); // New user username

  // Initialize Firebase Auth
  const auth = getAuth();

  // Load user from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const currentUser: User = {
          displayName: firebaseUser.displayName || "Anonymous",
          email: firebaseUser.email || "",
          profilePicture: firebaseUser.photoURL || "",
        };
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser)); // Save user to localStorage

        // Check if the user already exists in Firestore
        const exists = await userExists(firebaseUser.uid);
        if (!exists) {
          setShowNewUserPopup(true); // Show the new user popup
        } else {
          // If the user already exists, create/update the user document
          await createUserDocument(firebaseUser.uid, {
            displayName: currentUser.displayName,
            email: currentUser.email,
            profilePicture: currentUser.profilePicture,
          });
        }
      } else {
        setUser(null);
        localStorage.removeItem("user"); // Clear user from localStorage if signed out
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [auth]);

  // Handle profile image click
  const handleProfileClick = (): void => {
    if (user) {
      setShowDropdown((prev) => !prev); // Toggle dropdown visibility
    } else {
      handleSignIn(); // Trigger Google Sign-In popup
    }
  };

  // Function to handle Google Sign-In
  const handleSignIn = async (): Promise<void> => {
    try {
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser); // Update user state
      localStorage.setItem("user", JSON.stringify(signedInUser)); // Save user to localStorage

      // Check if the user already exists in Firestore
      const exists = await userExists(auth.currentUser?.uid || "");
      if (!exists) {
        setShowNewUserPopup(true); // Show the new user popup
      } else {
        // Create or update the user document
        await createUserDocument(auth.currentUser?.uid || "", {
          displayName: signedInUser.displayName,
          email: signedInUser.email,
          profilePicture: signedInUser.profilePicture,
        });
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  // Function to handle Sign-Out
  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut(auth); // Sign out the user from Firebase
      setUser(null); // Clear user state
      setShowDropdown(false); // Close dropdown
      localStorage.removeItem("user"); // Remove user from localStorage
      console.log("User signed out successfully.");
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  // Function to handle new user data submission
  const handleNewUserSubmit = async (): Promise<void> => {
    try {
      const uid = auth.currentUser?.uid || "";
      await createUserDocument(uid, {
        displayName: user?.displayName || "Anonymous",
        email: user?.email || "",
        profilePicture: user?.profilePicture || "",
        username,
        bio,
      });
      setShowNewUserPopup(false); // Close the popup
    } catch (error) {
      console.error("Error saving new user data:", error);
    }
  };

  return (
    <div className={styles.profileContainer}>
      {/* Profile Image */}
      <Image
        src={user?.profilePicture || (default_pfp as StaticImageData)} // Use Google profile picture or default
        alt="Profile"
        onClick={handleProfileClick}
        className={styles.profileImage}
        width={40}
        height={40}
      />
      {/* Dropdown Menu */}
      {showDropdown && (
        <div className={styles.dropdownMenu}>
          <button onClick={handleSignOut} className={styles.dropdownButton}>
            Sign Out
          </button>
        </div>
      )}
      {/* New User Popup */}
      {showNewUserPopup && (
        <>
          {/* Overlay */}
          <div className={styles.overlay}></div>

          {/* Popup */}
          <div className={styles.popup}>
            <h2>Welcome! Complete Your Profile</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.inputField}
            />
            <textarea
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={styles.textArea}
            />
            <button
              onClick={handleNewUserSubmit}
              className={styles.popupButton}
            >
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
}
