/**
 * ClickUp-style Tag Input Component
 * Reusable across employee and contractor dashboard expense forms.
 * Supports free-text creation, recent suggestions, deduplication, and chip display.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 24;

// Shared "recent tags" pool (simulates persisted recent tags)
const RECENT_TAGS_POOL = [
  'NY trip',
  'Client dinner',
  'Q1 offsite',
  'Home office',
  'Conference',
  'Team event',
  'Travel',
  'Onboarding',
];

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}

const normalise = (tag: string) => tag.trim().toLowerCase();

export const TagInput = ({ tags, onChange, className }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (raw: string) => {
      const trimmed = raw.trim().slice(0, MAX_TAG_LENGTH);
      if (!trimmed) return;
      if (tags.length >= MAX_TAGS) return;
      // Case-insensitive dedup
      if (tags.some((t) => normalise(t) === normalise(trimmed))) return;
      onChange([...tags, trimmed]);
      setInputValue('');
    },
    [tags, onChange],
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  // Filter recent suggestions
  const suggestions =
    isFocused && inputValue.length > 0
      ? RECENT_TAGS_POOL.filter(
          (s) =>
            normalise(s).includes(normalise(inputValue)) &&
            !tags.some((t) => normalise(t) === normalise(s)),
        ).slice(0, 5)
      : isFocused && inputValue.length === 0
        ? RECENT_TAGS_POOL.filter(
            (s) => !tags.some((t) => normalise(t) === normalise(s)),
          ).slice(0, 4)
        : [];

  // Close dropdown on outside click
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={cn('space-y-1.5', className)} ref={containerRef}>
      <Label className="text-xs">Tags (optional)</Label>

      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 min-h-[36px] px-2.5 py-1.5 rounded-md border bg-background transition-colors cursor-text',
          isFocused ? 'border-primary ring-2 ring-ring ring-offset-2' : 'border-input',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium max-w-[160px]"
          >
            <span className="truncate">{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(i);
              }}
              className="p-0.5 rounded-full hover:bg-primary/20 transition-colors shrink-0"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}

        {tags.length < MAX_TAGS && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? "Type and press Enter" : ""}
            className="flex-1 min-w-[80px] bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            maxLength={MAX_TAG_LENGTH}
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="rounded-md border border-border/60 bg-popover shadow-md py-1 max-h-[140px] overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur
                addTag(s);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted/60 transition-colors text-left"
            >
              <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Add tags to group expenses or give context (e.g., &lsquo;NY trip&rsquo;, &lsquo;Client dinner&rsquo;).
      </p>
    </div>
  );
};

/** Display-only tag chips for list views. Shows first N then "+X". */
export const TagChips = ({
  tags,
  max = 3,
  className,
}: {
  tags: string[];
  max?: number;
  className?: string;
}) => {
  if (!tags || tags.length === 0) return null;
  const visible = tags.slice(0, max);
  const remaining = tags.length - max;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {visible.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary/8 text-primary/80 text-[10px] font-medium max-w-[100px] truncate"
        >
          {tag}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
          +{remaining}
        </span>
      )}
    </div>
  );
};
