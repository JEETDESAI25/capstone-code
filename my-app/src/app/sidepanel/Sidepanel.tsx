import styles from "../../styles/SidePanel.module.css";

const SidePanel: React.FC = () => {
  return (
    <div className={styles.sidePanel}>
      <ul>
        <li>Dashboard</li>
        <li>Settings</li>
        <li>Profile</li>
        <li>Logout</li>
      </ul>
    </div>
  );
};

export default SidePanel;
