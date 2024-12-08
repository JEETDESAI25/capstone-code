import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../app/firebase/firebaseConfig";
import Link from "next/link";
import styles from "../styles/SearchBar.module.css";

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setResults([]); // Clear results if input is empty
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("username", ">=", value),
        where("username", "<=", value + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);

      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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
        value={searchTerm}
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
            href={`/profile/${user.id}`}
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
