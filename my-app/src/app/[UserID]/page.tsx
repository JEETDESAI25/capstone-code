"use client";

import { useState, useEffect } from "react";
import styles from "../../styles/App.module.css";
import Navbar from "../../components/Navbar";
import SidePanel from "../../components/Sidepanel";
import Post from "../../components/Post";
import default_pfp from "./../../../public/images/default_pfp.jpeg";
import Image from "next/image";
import { fetchDocumentById } from "../firebase/firebaseDatabase";

export default function ProfileDetails({
  params,
}: {
  params: {
    UserID: string;
  };
}) {
  const [user, setUser] = useState<{
    username: string;
    bio: string;
    profilePicture: string;
  } | null>(null);
  const [posts, setPosts] = useState<
    Array<{ id: string; content: string; timestamp: string }>
  >([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch user details
        const userData = await fetchDocumentById("users", params.UserID);
        if (userData) {
          setUser({
            username: userData.username,
            bio: userData.bio,
            profilePicture:
              userData.profilePicture || "/images/default_pfp.jpeg",
          });
        }

        // Fetch user's posts
        const userPosts = await fetchUserPosts(params.UserID); // Replace with Firestore query for posts
        setPosts(userPosts);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [params.UserID]);

  if (!user) {
    return <p>Loading...</p>; // Show loading until user data is fetched
  }

  return (
    <div className={styles.app}>
      <Navbar />
      <div className={styles.mainContent}>
        <SidePanel />
        <main className={styles.content}>
          <div className={styles.profileSection}>
            <Image
              src={user.profilePicture}
              alt="Profile"
              width={150}
              height={150}
              className={styles.profileImage}
            />
            <h2>{user.username}</h2>
            <p className={styles.profileBio}>
              {user.bio || "No bio available."}
            </p>
            <button className={styles.followButton}>Follow</button>
          </div>
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
        </main>
      </div>
    </div>
  );
}

// export default function Home() {
//   return (
//     <div className={styles.app}>
//       <Navbar />
//       <div className={styles.mainContent}>
//         <SidePanel />
//         <main className={styles.content}>
//           <div className={styles.profileSection}>
//             <Image className={styles.profileImage} src={default_pfp} alt="" />
//             <h2>Black Lives Matter Campaign</h2>
//             <p className={styles.description}>
//               Short Description of the cause and maybe some links.
//             </p>
//             <button className={styles.followButton}>Follow</button>
//           </div>
//           {/* Tabs */}
//           <div className={styles.tabs}>
//             <h2 className="active">Posts</h2>
//             <h2>News</h2>
//             <h2>Trending</h2>
//             <h2>Top Users</h2>
//           </div>
//           <Post
//             username="social_justice_warrior"
//             content="Lorem ipsum odor amet, consectetuer adipiscing elit. Eros himenaeos sed  netus sagittis maecenas commodo suspendisse fringilla aenean. Est  efficitur tempus tristique facilisi consequat tristique. Netus dictum  praesent sed magnis ut integer nibh. Mauris fames molestie habitasse,  facilisi lectus senectus. Magnis blandit varius neque eros sapien  lacinia."
//             imageUrl="/images/black-lives-matter.jpg"
//             timestamp="2h ago"
//           />
//         </main>
//       </div>
//     </div>
//   );
// }
