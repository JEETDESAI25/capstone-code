import React from "react";
import styles from "../styles/SearchBar.module.css";

const SearchBar: React.FC = () => {
  return (
    <input type="text" className={styles.searchInput} placeholder="Search..." />
  );
};

export default SearchBar;
