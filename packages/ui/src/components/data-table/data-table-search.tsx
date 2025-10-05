"use client";

import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import React from "react";

interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isPending?: boolean;
}

export const DataTableSearch = React.memo<DataTableSearchProps>(
  ({ value, onChange, placeholder, disabled, isPending }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
      },
      [onChange]
    );

    const handleFocus = React.useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = React.useCallback(() => {
      setIsFocused(false);
    }, []);

    // Restore focus if it was focused before
    React.useEffect(() => {
      if (isFocused && !disabled && inputRef.current) {
        inputRef.current.focus();
      }
    }, [disabled, isFocused]);

    return (
      <div className="flex items-center space-x-2">
        <Input
          ref={inputRef}
          placeholder={placeholder || "Search..."}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="max-w-sm"
          disabled={disabled}
        />
        {isPending && <Skeleton className="h-4 w-16" />}
      </div>
    );
  }
);

DataTableSearch.displayName = "DataTableSearch";
