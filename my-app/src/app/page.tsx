import styles from "../styles/App.module.css";
import Navbar from "./navbar/Navbar";
import SidePanel from "./sidepanel/Sidepanel";

export default function Home() {
  return (
    <div className={styles.app}>
      <Navbar />
      <div className={styles.mainContent}>
        <SidePanel />
        <div className={styles.content}>
          <div className={styles.filters}>
            <h1 className={styles.filter}>Home</h1>
            <h1 className={styles.filter}>Following</h1>
            <h1 className={styles.filter}>Popular</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
