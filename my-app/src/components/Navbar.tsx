import styles from "../styles/Navbar.module.css";
import SearchBar from "./SearchBar";
import default_pfp from "./../../public/images/default_pfp.jpeg";
import Image from "next/image";

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div>
        <h2 className={styles.uniteTitle}>Unite</h2>
      </div>
      <SearchBar />
      <Image className={styles.profileIcon} src={default_pfp} alt="" />
    </nav>
  );
};

export default Navbar;
