import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  RemoveFormatting,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ContractRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

type HeadingLevel = 1 | 2 | 3;

const headingOptions: { label: string; value: "paragraph" | HeadingLevel }[] = [
  { label: "Normal", value: "paragraph" },
  { label: "Heading 1", value: 1 },
  { label: "Heading 2", value: 2 },
  { label: "Heading 3", value: 3 },
];

export const ContractRichTextEditor: React.FC<ContractRichTextEditorProps> = ({
  content,
  onChange,
  className,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "max-w-none focus:outline-none min-h-[400px] px-6 py-4 text-sm text-foreground/80 leading-relaxed",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const getCurrentHeading = (): string => {
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    return "Normal";
  };

  const setHeading = (value: "paragraph" | HeadingLevel) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: value }).run();
    }
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-colors hover:bg-muted",
        isActive && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-5 bg-border mx-1" />
  );

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden bg-background flex flex-col", className)}>
      {/* Toolbar - sticky at top */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/30 sticky top-0 z-10 flex-shrink-0">
        {/* Heading Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1 text-sm font-normal hover:bg-muted"
            >
              {getCurrentHeading()}
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-32">
            {headingOptions.map((option) => (
              <DropdownMenuItem
                key={option.label}
                onClick={() => setHeading(option.value)}
                className={cn(
                  "cursor-pointer",
                  getCurrentHeading() === option.label && "bg-muted"
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarDivider />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Clear Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content - scrollable area */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* TipTap Editor Styles */}
      <style>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror p {
          margin-bottom: 1rem;
          font-size: 0.875rem;
          line-height: 1.625;
          color: hsl(var(--foreground) / 0.8);
        }
        .ProseMirror h1 {
          font-size: 1.125rem;
          font-weight: 500;
          margin-bottom: 1rem;
          text-align: center;
          color: hsl(var(--foreground));
        }
        .ProseMirror h2 {
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }
        .ProseMirror h3 {
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }
        .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        .ProseMirror strong {
          font-weight: 600;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror u {
          text-decoration: underline;
        }
        .ProseMirror s {
          text-decoration: line-through;
        }
        .ProseMirror .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
};

export default ContractRichTextEditor;
