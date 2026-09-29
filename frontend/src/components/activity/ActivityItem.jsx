import { format } from "date-fns";
import {
  BookMarked,
  CirclePlus,
  FileText,
  FolderKanban,
  FolderOpen,
  MinusCircle,
  NotebookPen,
} from "lucide-react";

const activityMessages = {
  "project.created": (activity) =>
    `Created project "${activity.metadata?.title}"`,

  "project.updated": (activity) =>
    `Updated project "${activity.metadata?.title}"`,

  "paper.saved": (activity) =>
    `Saved "${activity.metadata?.title}" to the library`,

  "paper.added_to_project": (activity) =>
    `Added "${activity.metadata?.title}" to this project`,

  "paper.removed_from_project": (activity) =>
    `Removed "${activity.metadata?.title}" from this project`,

  "note.created": (activity) =>
    `Created note "${activity.metadata?.title}"`,

  "document.uploaded": (activity) =>
    `Uploaded "${activity.metadata?.title}"`,

  "document.added_to_project": (activity) =>
    `Added "${activity.metadata?.title}" to this project`,

  "document.removed_from_project": (activity) =>
    `Removed "${activity.metadata?.title}" from this project`,

  "collection.created": (activity) =>
    `Created collection "${activity.metadata?.title}"`,

  "paper.added_to_collection": (activity) =>
    `Added "${activity.metadata?.title}" to collection "${activity.metadata?.collectionTitle}"`,

  "paper.removed_from_collection": (activity) =>
    `Removed "${activity.metadata?.title}" from collection "${activity.metadata?.collectionTitle}"`,

  "document.added_to_collection": (activity) =>
    `Added "${activity.metadata?.title}" to collection "${activity.metadata?.collectionTitle}"`,

  "document.removed_from_collection": (activity) =>
    `Removed "${activity.metadata?.title}" from collection "${activity.metadata?.collectionTitle}"`,
};

const getActionIcon = (action) => {
  if (action.startsWith("project")) return FolderKanban;
  if (action.startsWith("paper")) return BookMarked;
  if (action.startsWith("note")) return NotebookPen;
  if (action.startsWith("document")) return FileText;
  if (action.startsWith("collection")) return FolderOpen;
  return CirclePlus;
};

const getActionColor = (action) => {
  if (action.includes("created") || action.includes("saved") || action.includes("added")) {
    return "var(--success)";
  }
  if (action.includes("removed") || action.includes("deleted")) {
    return "var(--danger)";
  }
  if (action.includes("updated")) {
    return "var(--accent)";
  }
  return "var(--muted)";
};

const ActivityItem = ({ activity }) => {
  const Icon = getActionIcon(activity.action);
  const color = getActionColor(activity.action);
  const message =
    activityMessages[activity.action]?.(activity) ||
    activity.action.replace(/\./g, " ");

  const date = new Date(activity.createdAt);
  const today = new Date();
  const isToday =
    date.toDateString() === today.toDateString();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeLabel = isToday
    ? `Today, ${format(date, "h:mm a")}`
    : isYesterday
    ? `Yesterday, ${format(date, "h:mm a")}`
    : format(date, "MMM d, yyyy 'at' h:mm a");

  return (
    <article className="activity-item">
      <div className="activity-item__icon" style={{ color }}>
        <Icon size={16} />
      </div>

      <div className="activity-item__content">
        <p className="activity-item__message">{message}</p>

        <time className="activity-item__time" dateTime={activity.createdAt}>
          {timeLabel}
        </time>
      </div>
    </article>
  );
};

export default ActivityItem;