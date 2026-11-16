import React from "react";
import "./DraggableTestGlass.css";

const GLASS_CONFIG = {
  floating: true,
  cornerRadius: 32,
  zRadius: 36,
  refraction: 0.85,
  blurAmount: 0.0,
  chromAberration: 0.08,
  edgeHighlight: 0.24,
  specular: 0.25,
  fresnel: 1.1,
  shadowOpacity: 0.38,
  shadowSpread: 18,
  shadowOffsetY: 8,
};

const GLASS_CONFIG_STRING = JSON.stringify(GLASS_CONFIG);

export const DraggableTestGlass: React.FC = () => {
  return (
    <div
      data-glass="true"
      data-config={GLASS_CONFIG_STRING}
      className="nexus-draggable-glass-test"
      title="Drag me across the screen to test the liquid glass effect"
      aria-label="Liquid Glass Test Square"
    >
      <p className="nexus-draggable-glass-lorem">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
        cillum dolore eu fugiat nulla pariatur.
      </p>
    </div>
  );
};
