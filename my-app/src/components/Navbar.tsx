import styles from "../styles/Navbar.module.css";
import SearchBar from "./SearchBar";
import ProfileImage from "./ProfileImage";
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.uniteTitle}>
          <h1 className={styles.uniteTitle}>Unite</h1>
        </Link>
        <div className={styles.searchContainer}>
          <SearchBar />
        </div>
        <ProfileImage />
      </nav>
    </div>
  );
};

export default Navbar;
