import styles from "../styles/Navbar.module.css";
import SearchBar from "./SearchBar";
import ProfileImage from "./ProfileImage";

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.uniteTitle}>Unite</h1>
      <div className={styles.searchContainer}>
        <SearchBar />
      </div>
      <ProfileImage />
    </nav>
  );
};

export default Navbar;
