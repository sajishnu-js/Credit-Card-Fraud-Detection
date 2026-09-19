"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Cpu } from "lucide-react";
import { MODEL_LABELS, labelForModel } from "@/lib/constants";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  availableModels?: string[];
}

export function ModelSelector({ value, onChange, availableModels }: ModelSelectorProps) {
  const options = availableModels && availableModels.length > 0
    ? availableModels
    : Object.keys(MODEL_LABELS);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="model-select" className="flex items-center gap-1.5 text-xs tracking-[0.2em] text-cyan-300/70 uppercase">
        <Cpu className="size-3.5" /> Model
      </Label>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger
          id="model-select"
          className="h-11 w-full border-white/10 bg-white/[0.03] text-sm backdrop-blur focus-visible:ring-cyan-400/30 sm:w-72"
        >
          <SelectValue placeholder="Select a model">
            {(v: string | null) => (v ? labelForModel(v) : "Select a model")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((key) => (
            <SelectItem key={key} value={key}>
              {labelForModel(key)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
