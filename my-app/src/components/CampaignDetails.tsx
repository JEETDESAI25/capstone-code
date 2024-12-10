import { useState, useEffect } from "react";
import { auth } from "../app/firebase/firebaseConfig";
import {
  fetchCampaignPosts,
  createCampaignPost,
  likePost,
  addComment,
  addMemberByUsername,
} from "../app/firebase/firebaseDatabase";
import styles from "../styles/CampaignDetails.module.css";
import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa";

interface CampaignDetailsProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    category: string;
    creatorId: string;
    members: string[];
    imageUrl?: string;
  };
  onClose: () => void;
  isCreator: boolean;
}

interface Post {
  id: string;
  content: string;
  userId: string;
  imageUrl?: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export default function CampaignDetails({
  campaign,
  onClose,
  isCreator,
}: CampaignDetailsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [newComment, setNewComment] = useState("");
  const user = auth.currentUser;
  const [isClosing, setIsClosing] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(
    null
  );
  const [newMember, setNewMember] = useState("");

  const loadPosts = async () => {
    const fetchedPosts = await fetchCampaignPosts(campaign.id);
    setPosts(fetchedPosts);
  };

  useEffect(() => {
    loadPosts();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [campaign.id]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleCreatePost = async () => {
    if (!user || (!newPost.trim() && !postImage)) return;

    try {
      await createCampaignPost(campaign.id, {
        content: newPost,
        userId: user.uid,
        imageFile: postImage,
      });
      setNewPost("");
      setPostImage(null);
      loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImage(file);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    try {
      await likePost(campaign.id, postId, user.uid);
      loadPosts(); // Refresh posts to show updated likes
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!user || !content.trim()) return;
    try {
      await addComment(campaign.id, postId, {
        content,
        userId: user.uid,
      });
      loadPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.trim()) return;
    try {
      await addMemberByUsername(campaign.id, newMember);
      setNewMember("");
      // Optionally refresh campaign data to show new member
      // You might want to add a callback to refresh the campaign data from the parent
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  return (
    <div
      className={`${styles.modalOverlay} ${isClosing ? styles.closing : ""}`}
      onClick={handleClose}
    >
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2>Save Earth!</h2>
            <p>Environmental</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </header>

        <div className={styles.modalBody}>
          <main className={styles.mainContent}>
            <div className={styles.createPostBox}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share something with the group..."
                className={styles.postInput}
              />
              <div className={styles.fileInputContainer}>
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="file-upload"
                  className={styles.chooseFileButton}
                >
                  Choose File
                </label>
                <span className={styles.fileLabel}>
                  {postImage ? postImage.name : "No file chosen"}
                </span>
                <button
                  className={styles.postButton}
                  onClick={handleCreatePost}
                >
                  Post
                </button>
              </div>
            </div>

            <div className={styles.postsContainer}>
              {posts.map((post) => (
                <div key={post.id} className={styles.postCard}>
                  <div className={styles.postHeader}>
                    <span>{post.userId === user?.uid ? "You" : "Member"}</span>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                  </div>
                  <div className={styles.postContent}>
                    <p>{post.content}</p>
                    {post.imageUrl && (
                      <div className={styles.postImage}>
                        <img src={post.imageUrl} alt="Post content" />
                      </div>
                    )}
                    <div className={styles.postActions}>
                      <button
                        className={styles.likeButton}
                        onClick={() => handleLikePost(post.id)}
                      >
                        {post.likes?.includes(user?.uid || "") ? (
                          <FaHeart className={styles.liked} />
                        ) : (
                          <FaRegHeart />
                        )}
                        <span>{post.likes?.length || 0}</span>
                      </button>
                      <button
                        className={styles.commentButton}
                        onClick={() => setActiveCommentPost(post.id)}
                      >
                        <FaComment />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </div>

                    {activeCommentPost === post.id && (
                      <div className={styles.commentSection}>
                        <div className={styles.comments}>
                          {post.comments?.map((comment) => (
                            <div key={comment.id} className={styles.comment}>
                              <span className={styles.commentAuthor}>
                                {comment.userId === user?.uid
                                  ? "You"
                                  : "Member"}
                              </span>
                              <p>{comment.content}</p>
                            </div>
                          ))}
                        </div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleAddComment(post.id, newComment);
                          }}
                        >
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className={styles.commentInput}
                          />
                          <button
                            type="submit"
                            className={styles.commentSubmit}
                          >
                            Post
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.aboutSection}>
              <h3>About Campaign</h3>
              <p>{campaign.description}</p>
            </div>

            <div className={styles.membersSection}>
              <h3>Members ({campaign.members.length})</h3>
              {isCreator && (
                <div className={styles.addMemberForm}>
                  <input
                    type="text"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    placeholder="Enter username to add"
                    className={styles.addMemberInput}
                  />
                  <button
                    onClick={handleAddMember}
                    className={styles.addButton}
                  >
                    Add
                  </button>
                </div>
              )}
              <div className={styles.membersList}>
                {campaign.members.map((memberId) => (
                  <div key={memberId} className={styles.memberCard}>
                    {memberId}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
