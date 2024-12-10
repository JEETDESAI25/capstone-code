"use client";

import { useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  createCampaign,
  deleteCampaign,
  fetchUserCampaigns,
} from "../firebase/firebaseDatabase";
import styles from "../../styles/Campaign.module.css";
import Navbar from "../../components/Navbar";
import SidePanel from "../../components/Sidepanel";
import CampaignCard from "../../components/CampaignCard";
import CreateCampaignForm from "../../components/createCampaignForm";
import LoadingScreen from "../../components/LoadingScreen";
import CampaignDetails from "../../components/CampaignDetails";

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  creatorId: string;
  createdAt: string;
  members: string[];
  imageUrl?: string;
}

export default function CampaignPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      if (currentUser) {
        try {
          const fetchedCampaigns = await fetchUserCampaigns(currentUser.uid);
          setCampaigns(fetchedCampaigns as Campaign[]);
        } catch (error) {
          console.error("Error loading campaigns:", error);
        }
      } else {
        setCampaigns([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      if (!user) return;
      await deleteCampaign(campaignId, user.uid);
      setCampaigns((prevCampaigns) =>
        prevCampaigns.filter((campaign) => campaign.id !== campaignId)
      );
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      if (!user) return;
      const newCampaign = await createCampaign({
        ...campaignData,
        creatorId: user.uid,
      });
      setCampaigns((prev) => [newCampaign, ...prev]);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  if (!authChecked || loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className={styles.app}>
        <Navbar />
        <div className={styles.mainContent}>
          <SidePanel />
          <main className={styles.content}>
            <div className={styles.noUserMessage}>
              Please log in to view your campaigns
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Navbar />
      <div className={styles.mainContent}>
        <SidePanel />
        <main className={styles.content}>
          <div className={styles.campaignHeader}>
            <h1>Your Campaigns</h1>
            <button
              className={styles.createButton}
              onClick={() => setShowCreateForm(true)}
            >
              Create Campaign
            </button>
          </div>

          <div className={styles.campaignsContainer}>
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onDelete={handleDeleteCampaign}
                onClick={() => setSelectedCampaign(campaign)}
              />
            ))}
          </div>

          {showCreateForm && (
            <CreateCampaignForm
              onClose={() => setShowCreateForm(false)}
              onSubmit={handleCreateCampaign}
            />
          )}

          {selectedCampaign && (
            <CampaignDetails
              campaign={selectedCampaign}
              onClose={() => setSelectedCampaign(null)}
              isCreator={selectedCampaign.creatorId === user?.uid}
            />
          )}
        </main>
      </div>
    </div>
  );
}
