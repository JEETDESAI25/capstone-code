"use client";

import { useState, useRef } from "react";
import styles from "../styles/CreatePost.module.css";
import { getAuth } from "firebase/auth";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../app/firebase/firebaseConfig";
import Image from "next/image";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = getAuth();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("File size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to create a post.");
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = "";

      if (imageFile) {
        // Create a storage reference
        const storageRef = ref(
          storage,
          `posts/${user.uid}/${Date.now()}_${imageFile.name}`
        );

        // Upload the file
        const uploadTask = await uploadBytes(storageRef, imageFile);

        // Get the download URL
        imageUrl = await getDownloadURL(uploadTask.ref);
        console.log("Image uploaded successfully:", imageUrl);
      }

      // Create the post document
      const postData = {
        uid: user.uid,
        username: user.displayName || "Anonymous",
        content: content,
        imageUrl: imageUrl,
        timestamp: Timestamp.now(),
      };

      console.log("Creating post with data:", postData);

      const docRef = await addDoc(collection(db, "posts"), postData);
      console.log("Post created with ID:", docRef.id);

      // Reset form
      setContent("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form className={styles.createPostForm} onSubmit={handleSubmit}>
      <textarea
        className={styles.textArea}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        required
      />
      <div className={styles.imageUploadSection}>
        <div className={styles.fileInputContainer}>
          <button type="button" className={styles.customFileButton}>
            Choose Image
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            ref={fileInputRef}
            className={styles.fileInput}
          />
        </div>
        {imagePreview && (
          <div className={styles.imagePreview}>
            <Image
              src={imagePreview}
              alt="Preview"
              width={300}
              height={200}
              style={{ objectFit: "cover", width: "100%", height: "auto" }}
              priority
            />
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className={styles.removeImage}
            >
              Remove
            </button>
          </div>
        )}
      </div>
      <div className={styles.postActions}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isUploading}
        >
          {isUploading ? (
            <div className={styles.loadingSpinner}>Posting...</div>
          ) : (
            "Post"
          )}
        </button>
      </div>
    </form>
  );
}
