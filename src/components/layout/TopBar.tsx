import React, { useState } from "react";
import { LiquidGlassPanel } from "../glass/LiquidGlassPanel";
import { SearchIcon, ReminderIcon } from "../icons";
import "./TopBar.css";

export interface TopBarProps {
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSearch,
  onNotificationClick,
  onProfileClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearch?.(val);
  };

  return (
    <header className="nexus-topbar" role="banner">
      {/* Search Input Bar (Figma Rectangle 1 & Search component) */}
      <LiquidGlassPanel variant="search" className="nexus-search-container">
        <input
          type="text"
          className="nexus-search-input"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search"
        />
        <div className="nexus-search-icon-wrapper">
          <SearchIcon size={24} />
        </div>
      </LiquidGlassPanel>

      {/* Center Title (Figma Nexus Text) */}
      <div className="nexus-title-wrapper">
        <h1 className="nexus-title">Nexus</h1>
      </div>

      {/* Right Actions: Notification & Profile */}
      <div className="nexus-topbar-actions">
        {/* Notification Bell (Figma Reminder component) */}
        <button
          type="button"
          className="nexus-reminder-btn"
          onClick={onNotificationClick}
          aria-label="Notifications"
          title="Notifications"
        >
          <ReminderIcon size={26} />
        </button>

        {/* Profile Circle (Figma Profile Frame) */}
        <LiquidGlassPanel
          variant="profile"
          className="nexus-profile-btn"
          onClick={onProfileClick}
          role="button"
          tabIndex={0}
          aria-label="User Profile"
          title="User Profile"
        />
      </div>
    </header>
  );
};
