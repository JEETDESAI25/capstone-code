import Navbar from "./Navbar";
import SidePanel from "./Sidepanel";
import globalStyles from "../styles/App.module.css";
import styles from "../styles/LoadingScreen.module.css";

export default function LoadingScreen() {
  return (
    <div className={globalStyles.app}>
      <Navbar />
      <div className={globalStyles.mainContent}>
        <SidePanel />
        <main className={globalStyles.content}>
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner} />
          </div>
        </main>
      </div>
    </div>
  );
}
