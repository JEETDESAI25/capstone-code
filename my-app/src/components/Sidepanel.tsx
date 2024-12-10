"use client";

import Link from "next/link";
import styles from "../styles/SidePanel.module.css";
import { usePathname } from "next/navigation";

const SidePanel: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className={styles.sidePanelContainer}>
      <aside className={styles.sidePanel}>
        <ul>
          <li>
            <Link
              href="/"
              className={`${styles.navLink} ${
                pathname === "/" ? styles.active : ""
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/popular"
              className={`${styles.navLink} ${
                pathname === "/popular" ? styles.active : ""
              }`}
            >
              Popular
            </Link>
          </li>
          <li>
            <Link
              href="/following"
              className={`${styles.navLink} ${
                pathname === "/following" ? styles.active : ""
              }`}
            >
              Following
            </Link>
          </li>
          <li>
            <Link
              href="/campaign"
              className={`${styles.navLink} ${
                pathname === "/campaign" ? styles.active : ""
              }`}
            >
              Campaign
            </Link>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default SidePanel;
