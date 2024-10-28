import styles from "../styles/Navbar.module.css";
import SearchBar from "./Searchbar.tsx";
import default_pfp from "./../../public/images/default_pfp.jpeg";
import Image from "next/image";

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <h2 className={styles.uniteTitle}>Unite</h2>
      <SearchBar />
      <Image className={styles.profilePicture} src={default_pfp} alt="" />
    </nav>
  );
};

export default Navbar;
