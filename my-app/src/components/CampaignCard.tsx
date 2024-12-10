import { auth } from "../app/firebase/firebaseConfig";
import styles from "../styles/CampaignCard.module.css";
import { FaUsers, FaCalendarAlt } from "react-icons/fa";
import { useState } from "react";
import CampaignDetails from "./CampaignDetails";
import { fetchDocumentById } from "@/app/firebase/firebaseDatabase";

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    category: string;
    creatorId: string;
    createdAt: string;
    members: string[];
    imageUrl?: string;
  };
  onDelete: (campaignId: string) => void;
  onClick: () => void;
}

export default function CampaignCard({
  campaign,
  onDelete,
  onClick,
}: CampaignCardProps) {
  const user = auth.currentUser;
  const isCreator = user?.uid === campaign.creatorId;
  const formattedDate = new Date(campaign.createdAt).toLocaleDateString();
  const [campaignData, setCampaignData] = useState(campaign);
  const [showDetails, setShowDetails] = useState(false);

  const handleCampaignUpdate = async () => {
    const updatedCampaign = await fetchDocumentById("campaigns", campaign.id);
    if (updatedCampaign && "title" in updatedCampaign) {
      setCampaignData(updatedCampaign as typeof campaign);
    }
  };

  const handleClick = () => {
    setShowDetails(true);
    onClick();
  };

  return (
    <>
      <div className={styles.campaignCard} onClick={handleClick}>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{campaign.title}</h3>
            <span className={styles.categoryTag}>{campaign.category}</span>
          </div>
          <p className={styles.cardDescription}>{campaign.description}</p>
          <div className={styles.cardFooter}>
            <div className={styles.metaInfo}>
              <span className={styles.memberCount}>
                <FaUsers /> {campaign.members.length} members
              </span>
              <span className={styles.createdAt}>
                <FaCalendarAlt /> {formattedDate}
              </span>
            </div>
            {isCreator && (
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(campaign.id);
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {showDetails && (
        <CampaignDetails
          campaign={campaignData}
          onClose={() => setShowDetails(false)}
          isCreator={isCreator}
          onUpdate={handleCampaignUpdate}
        />
      )}
    </>
  );
}
