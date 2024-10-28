import styles from "../styles/SidePanel.module.css";

const SidePanel: React.FC = () => {
  return (
    <div className={styles.sidePanel}>
      <ul>
        <li>Home</li>
        <li>Popular</li>
        <li>Following</li>
        <li>For You</li>
      </ul>
    </div>
  );
};

export default SidePanel;
