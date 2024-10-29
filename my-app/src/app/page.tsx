// src/app/page.tsx
import styles from "../styles/App.module.css";
import Navbar from "../components/Navbar";
import SidePanel from "../components/Sidepanel";
import Post from "../components/Posts";
import Image from "next/image";

export default function Home() {
  return (
    <div className={styles.app}>
      <Navbar />
      <div className={styles.mainContent}>
        <SidePanel />
        <div className={styles.content}>
          <div className={styles.profileSection}>
            <Image
              src="/images/profile.jpeg"
              alt="Profile"
              width={150}
              height={150}
              className={styles.profileImage}
            />
            <h2>Black Lives Matter Campaign</h2>
            <p className={styles.description}>
              Short Description of the cause and maybe some links.
            </p>
            <button className={styles.followButton}>Follow</button>
          </div>
          {/* Tabs */}
          <div className={styles.tabs}>
            <h2 className={styles.active}>Posts</h2>
            <h2>News</h2>
            <h2>Trending</h2>
            <h2>Top Users</h2>
          </div>
          <Post
            username="social_justice_warrior"
            content="Lorem ipsum odor amet, consectetuer adipiscing elit. Eros himenaeos sed  netus sagittis maecenas commodo suspendisse fringilla aenean. Est  efficitur tempus tristique facilisi consequat tristique. Netus dictum  praesent sed magnis ut integer nibh. Mauris fames molestie habitasse,  facilisi lectus senectus. Magnis blandit varius neque eros sapien  lacinia."
            imageUrl="/images/black-lives-matter.jpg"
            timestamp="2h ago"
          />
        </div>
      </div>
    </div>
  );
}
