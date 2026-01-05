'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  'aria-label'?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = '선택하세요',
  disabled = false,
  className = '',
  triggerClassName = '',
  'aria-label': ariaLabel,
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={`
          inline-flex items-center justify-between gap-2
          px-4 py-2 min-w-[140px]
          border border-neutral-300 rounded-lg
          bg-white text-sm text-neutral-900
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100
          hover:bg-neutral-50 transition-colors
          ${triggerClassName} ${className}
        `}
        aria-label={ariaLabel}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown size={16} className="text-neutral-500" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="
            overflow-hidden bg-white rounded-lg shadow-lg border border-neutral-200
            z-50 min-w-[var(--radix-select-trigger-width)]
            animate-in fade-in-0 zoom-in-95
          "
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-white cursor-default">
            <ChevronUp size={16} />
          </SelectPrimitive.ScrollUpButton>
          
          <SelectPrimitive.Viewport className="p-1 max-h-[300px]">
            {options
              .filter((option) => option.value !== '') // Filter out empty string values (Radix requires non-empty)
              .map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="
                  relative flex items-center px-8 py-2 text-sm text-neutral-900 rounded-md
                  cursor-pointer select-none outline-none
                  data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900
                  data-[disabled]:text-neutral-400 data-[disabled]:pointer-events-none
                  transition-colors
                "
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <Check size={14} className="text-blue-600" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-white cursor-default">
            <ChevronDown size={16} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

// Group 지원이 필요한 경우를 위한 확장 컴포넌트
interface SelectGroupOption {
  label: string;
  options: SelectOption[];
}

interface GroupedSelectProps extends Omit<SelectProps, 'options'> {
  groups: SelectGroupOption[];
}

export function GroupedSelect({
  value,
  onValueChange,
  groups,
  placeholder = '선택하세요',
  disabled = false,
  className = '',
  triggerClassName = '',
  'aria-label': ariaLabel,
}: GroupedSelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={`
          inline-flex items-center justify-between gap-2
          px-4 py-2 min-w-[140px]
          border border-neutral-300 rounded-lg
          bg-white text-sm text-neutral-900
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100
          hover:bg-neutral-50 transition-colors
          ${triggerClassName} ${className}
        `}
        aria-label={ariaLabel}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown size={16} className="text-neutral-500" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="
            overflow-hidden bg-white rounded-lg shadow-lg border border-neutral-200
            z-50 min-w-[var(--radix-select-trigger-width)]
            animate-in fade-in-0 zoom-in-95
          "
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-white cursor-default">
            <ChevronUp size={16} />
          </SelectPrimitive.ScrollUpButton>
          
          <SelectPrimitive.Viewport className="p-1 max-h-[300px]">
            {groups.map((group, idx) => (
              <SelectPrimitive.Group key={idx}>
                <SelectPrimitive.Label className="px-8 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {group.label}
                </SelectPrimitive.Label>
                {group.options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className="
                      relative flex items-center px-8 py-2 text-sm text-neutral-900 rounded-md
                      cursor-pointer select-none outline-none
                      data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900
                      data-[disabled]:text-neutral-400 data-[disabled]:pointer-events-none
                      transition-colors
                    "
                  >
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                      <Check size={14} className="text-blue-600" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Group>
            ))}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-white cursor-default">
            <ChevronDown size={16} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export default Select;
