import Link from "next/link";
import styles from "../styles/SidePanel.module.css";

const SidePanel: React.FC = () => {
  return (
    <div className={styles.sidePanelContainer}>
      <aside className={styles.sidePanel}>
        <ul>
          <li>
            <Link href="/" className={styles.navLink}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/popular" className={styles.navLink}>
              Popular
            </Link>
          </li>
          <li>
            <Link href="/following" className={styles.navLink}>
              Following
            </Link>
          </li>
          <li>
            <Link href="/campaign" className={styles.navLink}>
              Campaign
            </Link>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default SidePanel;
