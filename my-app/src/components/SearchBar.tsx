import React, { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../app/firebase/firebaseConfig";
import Link from "next/link";
import styles from "../styles/SearchBar.module.css";

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>(""); // User input
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value); // Preserve original casing for display

    if (value.trim() === "") {
      setResults([]); // Clear results if input is empty
      return;
    }

    const normalizedValue = value.toLowerCase(); // Normalize to lowercase for search

    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);

      // Filter results by case-insensitive comparison
      const users = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) =>
          (user.username || "").toLowerCase().includes(normalizedValue)
        );

      setResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search by username..."
        value={searchTerm} // Show user input as typed
        onChange={handleSearch}
      />
      <div
        className={`${styles.searchResults} ${
          results.length > 0 ? styles.active : ""
        }`}
      >
        {results.map((user) => (
          <Link
            key={user.id}
            href={`/${user.id}`}
            className={styles.resultItem}
          >
            <div>
              <img
                src={user.profilePicture || "/default-profile.png"}
                alt={`${user.username}'s profile`}
                className={styles.profileImage}
              />
              <span>{user.username}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
