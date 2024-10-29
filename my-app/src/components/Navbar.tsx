import styles from "../styles/Navbar.module.css";
import SearchBar from "./SearchBar";
import Image from "next/image";
import default_pfp from "./../../public/images/default_pfp.jpeg";

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.uniteTitle}>Unite</h1>
      <div className={styles.searchContainer}>
        <SearchBar />
      </div>
      <Image
        src={default_pfp}
        alt="Profile"
        className={styles.profileIcon}
        width={40}
        height={40}
      />
    </nav>
  );
};

export default Navbar;
