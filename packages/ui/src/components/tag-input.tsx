"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { X } from "lucide-react";
import React from "react";

export interface TagInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  tags: string[];
  setTags:
    | React.Dispatch<React.SetStateAction<string[]>>
    | ((tags: string[]) => void);
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (props, ref) => {
    const { placeholder, tags, setTags, className, disabled, ...rest } = props;

    const [inputValue, setInputValue] = React.useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const commitTag = (raw: string) => {
      const newTag = raw.trim();
      if (newTag && !tags.includes(newTag)) {
        if (typeof setTags === "function") {
          // support both React.Dispatch and callback setter
          setTags([...tags, newTag]);
        }
      }
      setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        commitTag(inputValue);
      } else if (
        e.key === "Backspace" &&
        inputValue === "" &&
        tags.length > 0
      ) {
        // convenience: remove last tag when backspacing on empty input
        const next = tags.slice(0, -1);
        setTags(next);
      }
    };

    const removeTag = (tagToRemove: string) => {
      setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
      <div>
        <div
          className={cn(
            "flex flex-wrap gap-2 rounded-md",
            tags.length !== 0 && "mb-3"
          )}
        >
          {tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} className="hover:pointer-cursor">
              {tag}
              {!disabled && (
                <div
                  onClick={() => removeTag(tag)}
                  className={
                    "p-1 h-full hover:bg-transparent hover:cursor-pointer"
                  }
                >
                  <X size={14} />
                </div>
              )}
            </Badge>
          ))}
        </div>
        {!disabled && (
          <Input
            ref={ref}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={className}
            {...rest}
          />
        )}
      </div>
    );
  }
);

TagInput.displayName = "TagInput";

export default TagInput;
