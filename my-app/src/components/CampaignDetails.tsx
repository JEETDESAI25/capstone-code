import { useState, useEffect, useRef } from "react";
import { auth } from "../app/firebase/firebaseConfig";
import {
  fetchCampaignPosts,
  createCampaignPost,
  likePost,
  addComment,
  addMemberByUsername,
  getUsernameById,
} from "../app/firebase/firebaseDatabase";
import styles from "../styles/CampaignDetails.module.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";

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
  onUpdate?: () => void;
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
  onUpdate,
}: CampaignDetailsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [user] = useState(auth.currentUser);
  const [isClosing, setIsClosing] = useState(false);
  const [newMember, setNewMember] = useState("");
  const [addMemberError, setAddMemberError] = useState<string>("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberUsernames, setMemberUsernames] = useState<{
    [key: string]: string;
  }>({});
  const postButtonRef = useRef<HTMLButtonElement>(null);

  const loadPosts = async () => {
    try {
      const fetchedPosts = await fetchCampaignPosts(campaign.id);
      setPosts(
        fetchedPosts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  useEffect(() => {
    loadPosts();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [campaign.id]);

  useEffect(() => {
    const fetchUsernames = async () => {
      const usernamesMap: { [key: string]: string } = {};
      for (const memberId of campaign.members) {
        const username = await getUsernameById(memberId);
        usernamesMap[memberId] = username;
      }
      setMemberUsernames(usernamesMap);
    };

    fetchUsernames();
  }, [campaign.members]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("handleImageUpload triggered", { file });

    if (!file) {
      console.log("No file selected");
      setPostImage(null);
      setImagePreviewUrl(null);
      return;
    }

    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File is too large. Please select an image under 5MB");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setPostImage(file);
    console.log("Image file set successfully with preview URL");
  };

  // Clean up preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleCreatePost = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to post");
      return;
    }
    if (!newPost.trim() && !postImage) {
      alert("Please enter some content or choose an image");
      return;
    }

    try {
      console.log("Starting post creation...", {
        content: newPost,
        userId: user.uid,
        campaignId: campaign.id,
        hasImage: !!postImage,
        imageDetails: postImage
          ? {
              name: postImage.name,
              size: postImage.size,
              type: postImage.type,
            }
          : null,
      });

      // Show loading state
      if (postButtonRef.current) {
        postButtonRef.current.disabled = true;
        postButtonRef.current.textContent = "Posting...";
      }

      const result = await createCampaignPost(campaign.id, {
        content: newPost,
        userId: user.uid,
        imageFile: postImage,
      });

      console.log("Post created successfully:", result);

      // Clear form
      setNewPost("");
      setPostImage(null);

      // Reset file input
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      // Reload posts
      await loadPosts();
    } catch (error) {
      console.error("Error in handleCreatePost:", error);
      let errorMessage = "Failed to create post. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      // Reset button state
      if (postButtonRef.current) {
        postButtonRef.current.disabled = false;
        postButtonRef.current.textContent = "Post";
      }
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

    setIsAddingMember(true);
    setAddMemberError("");

    try {
      // Check if member is already in the campaign
      if (campaign.members.includes(newMember)) {
        setAddMemberError("User is already a member of this campaign");
        return;
      }

      await addMemberByUsername(campaign.id, newMember);
      setNewMember("");

      // Refresh campaign data
      if (onUpdate) {
        onUpdate();
      }

      // Optionally show success message
      // You might want to add a success state to show this
    } catch (error) {
      if (error instanceof Error) {
        setAddMemberError(error.message);
      } else {
        setAddMemberError("Failed to add member. Please try again.");
      }
    } finally {
      setIsAddingMember(false);
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
            <h2>{campaign.title}</h2>
            <p>{campaign.category}</p>
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
                <div className={styles.uploadPreview}>
                  <div className={styles.leftSide}>
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="file-upload"
                      className={styles.chooseFileButton}
                    >
                      Choose File
                    </label>
                    {postImage && (
                      <div className={styles.selectedFile}>
                        <span className={styles.fileName}>
                          {postImage.name}
                        </span>
                        <button
                          type="button"
                          className={styles.removeFile}
                          onClick={(e) => {
                            e.preventDefault();
                            setPostImage(null);
                            setImagePreviewUrl(null);
                            const fileInput = document.getElementById(
                              "file-upload"
                            ) as HTMLInputElement;
                            if (fileInput) fileInput.value = "";
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    ref={postButtonRef}
                    className={styles.postButton}
                    onClick={(e) => {
                      console.log("Post button clicked", {
                        hasContent: !!newPost.trim(),
                        hasImage: !!postImage,
                        isUserLoggedIn: !!user,
                      });
                      handleCreatePost(e);
                    }}
                    disabled={(!newPost.trim() && !postImage) || !user}
                  >
                    Post
                  </button>
                </div>
                {imagePreviewUrl && (
                  <div className={styles.imagePreview}>
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className={styles.previewImage}
                    />
                  </div>
                )}
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
                  </div>
                  <div className={styles.postActions}>
                    <button
                      className={`${styles.likeButton} ${
                        post.likes?.includes(user?.uid || "")
                          ? styles.liked
                          : ""
                      }`}
                      onClick={() => handleLikePost(post.id)}
                    >
                      {post.likes?.includes(user?.uid || "") ? (
                        <FaHeart />
                      ) : (
                        <FaRegHeart />
                      )}
                      <span>{post.likes?.length || 0}</span>
                    </button>
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
                    disabled={isAddingMember}
                  />
                  <button
                    onClick={handleAddMember}
                    className={styles.addButton}
                    disabled={isAddingMember || !newMember.trim()}
                  >
                    {isAddingMember ? "Adding..." : "Add"}
                  </button>
                  {addMemberError && (
                    <p className={styles.errorMessage}>{addMemberError}</p>
                  )}
                </div>
              )}
              <div className={styles.membersList}>
                {campaign.members.map((memberId) => (
                  <div key={memberId} className={styles.memberCard}>
                    {memberUsernames[memberId] || "Loading..."}
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
