import { useState } from "react";
import { auth } from "../app/firebase/firebaseConfig";
import styles from "../styles/Campaign.module.css";

interface CreateCampaignFormProps {
  onClose: () => void;
  onSubmit: (campaignData: {
    title: string;
    description: string;
    category: string;
    creatorId: string;
    imageUrl?: string;
  }) => Promise<void>;
}

export default function CreateCampaignForm({
  onClose,
  onSubmit,
}: CreateCampaignFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = auth.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        category,
        creatorId: user.uid,
        members: [user.uid],
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.createCampaignModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>Create New Campaign</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.createForm}>
          <div className={styles.formGroup}>
            <label>Campaign Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter campaign title"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your campaign"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              <option value="Environmental">Environmental</option>
              <option value="Social Justice">Social Justice</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Human Rights">Human Rights</option>
            </select>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
