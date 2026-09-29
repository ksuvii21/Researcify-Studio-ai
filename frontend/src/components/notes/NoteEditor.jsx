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

import { useState } from "react";

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
  tags = [],
  setTags,
}) => {
  const [tagDraft, setTagDraft] = useState("");

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const addTag = () => {
    const value = tagDraft.trim();

    if (!value || tags.includes(value)) {
      setTagDraft("");
      return;
    }

    setTags([...tags, value]);
    setTagDraft("");
  };

  const removeTag = (tag) => {
    setTags(tags.filter((item) => item !== tag));
  };

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

      <div className="note-editor__tags">
        {tags.map((tag) => (
          <span key={tag}>
            {tag}

            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={() => removeTag(tag)}
            >
              ×
            </button>
          </span>
        ))}

        <input
          className="note-editor__tag-input"
          value={tagDraft}
          onChange={(event) =>
            setTagDraft(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag();
            }
          }}
          onBlur={addTag}
          placeholder="Add a tag..."
        />
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
          Changes save automatically
        </span>
      </footer>
    </main>
  );
};

export default NoteEditor;