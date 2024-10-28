import styles from "../styles/App.module.css";
import Navbar from "../components/Navbar";
import SidePanel from "../components/Sidepanel";

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
            <h1 className={styles.filter}>For You</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
