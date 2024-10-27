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
          <h1>Welcome to My Next.js App</h1>
          <p>This is a basic starting page with a navbar and a side panel.</p>
        </div>
      </div>
    </div>
  );
}
