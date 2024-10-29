import styles from "../styles/App.module.css";
import Navbar from "../components/Navbar";
import SidePanel from "../components/Sidepanel";
import Post from "../components/Post";

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
          <div className={styles.postsContainer}>
            <Post
              username="social_justice_warrior"
              content="Lorem ipsum odor amet, consectetuer adipiscing elit. Eros himenaeos sed  netus sagittis maecenas commodo suspendisse fringilla aenean. Est  efficitur tempus tristique facilisi consequat tristique. Netus dictum  praesent sed magnis ut integer nibh. Mauris fames molestie habitasse,  facilisi lectus senectus. Magnis blandit varius neque eros sapien  lacinia."
              imageUrl="/images/black-lives-matter.jpg"
              timestamp="2h ago"
            />
            <Post
              username="social_justice_warrior"
              content="Lorem ipsum odor amet, consectetuer adipiscing elit. Eros himenaeos sed  netus sagittis maecenas commodo suspendisse fringilla aenean. Est  efficitur tempus tristique facilisi consequat tristique. Netus dictum  praesent sed magnis ut integer nibh. Mauris fames molestie habitasse,  facilisi lectus senectus. Magnis blandit varius neque eros sapien  lacinia."
              imageUrl="/images/black-lives-matter.jpg"
              timestamp="2h ago"
            />
            <Post
              username="social_justice_warrior"
              content="Lorem ipsum odor amet, consectetuer adipiscing elit. Eros himenaeos sed  netus sagittis maecenas commodo suspendisse fringilla aenean. Est  efficitur tempus tristique facilisi consequat tristique. Netus dictum  praesent sed magnis ut integer nibh. Mauris fames molestie habitasse,  facilisi lectus senectus. Magnis blandit varius neque eros sapien  lacinia."
              imageUrl="/images/black-lives-matter.jpg"
              timestamp="2h ago"
            />
            <Post
              username="social_justice_warrior"
              content="Lorem ipsum odor amet, consectetuer adipiscing elit. Eros himenaeos sed  netus sagittis maecenas commodo suspendisse fringilla aenean. Est  efficitur tempus tristique facilisi consequat tristique. Netus dictum  praesent sed magnis ut integer nibh. Mauris fames molestie habitasse,  facilisi lectus senectus. Magnis blandit varius neque eros sapien  lacinia."
              imageUrl="/images/black-lives-matter.jpg"
              timestamp="2h ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
