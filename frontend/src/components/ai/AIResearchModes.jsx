import {
  GitCompareArrows,
  Microscope,
  SearchCheck,
  Sparkles,
} from "lucide-react";

const modeIcons = {
  research: Microscope,
  summarize: Sparkles,
  compare: GitCompareArrows,
  gaps: SearchCheck,
};

const AIResearchModes = ({
  modes,
  activeMode,
  setActiveMode,
}) => {
  return (
    <div className="ai-modes">
      {modes.map((mode) => {
        const Icon = modeIcons[mode.id];

        return (
          <button
            type="button"
            key={mode.id}
            className={
              activeMode === mode.id
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveMode(mode.id)
            }
          >
            <Icon size={17} />

            <div>
              <strong>{mode.label}</strong>
              <span>{mode.description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default AIResearchModes;