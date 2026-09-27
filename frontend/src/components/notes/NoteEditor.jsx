import {
  Bold,
  Code,
  Heading2,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";

const toolbar = [
  {
    label: "Heading",
    icon: Heading2,
  },
  {
    label: "Bold",
    icon: Bold,
  },
  {
    label: "Italic",
    icon: Italic,
  },
  {
    label: "Bullet list",
    icon: List,
  },
  {
    label: "Numbered list",
    icon: ListOrdered,
  },
  {
    label: "Quote",
    icon: Quote,
  },
  {
    label: "Code",
    icon: Code,
  },
  {
    label: "Link",
    icon: Link,
  },
];

const NoteEditor = ({
  title,
  setTitle,
  content,
  setContent,
}) => {
  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <main className="note-editor">
      <input
        className="note-title-input"
        value={title}
        onChange={(event) =>
          setTitle(event.target.value)
        }
        placeholder="Untitled note"
      />

      <div className="note-editor__toolbar">
        {toolbar.map(
          ({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              title={label}
              aria-label={label}
            >
              <Icon size={16} />
            </button>
          )
        )}
      </div>

      <textarea
        className="note-editor__content"
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        placeholder="Start writing your research notes..."
      />

      <footer className="note-editor__footer">
        <span>
          {wordCount}{" "}
          {wordCount === 1
            ? "word"
            : "words"}
        </span>

        <span>
          Research note
        </span>
      </footer>
    </main>
  );
};

export default NoteEditor;