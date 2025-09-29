'use client';

import React, {FunctionComponent, SVGProps} from "react";
import {TableIcon} from "@/components/icons/TableIcon";
import {CardIcon} from "@/components/icons/CardIcon";
import { useEventListener } from '@/hooks/useEventHooks';

function GetButton({
  checked,
  Icon,
} : { checked: boolean; Icon: FunctionComponent<SVGProps<any>> }) {
  return (
    <button
      style={{
        backgroundColor: checked ? 'white' : 'transparent',
        justifyContent: 'center',
        width: 32,
        height: 28,
        border: 'none',
        cursor: 'pointer',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Icon fill={checked ? 'black' : '#b2b2b2'} />
    </button>
  );
}

const STORAGE_KEY = 'admin-view-mode';
export function useToggleWithStorage(
  defaultValue: boolean = false,
  storageKey: string = STORAGE_KEY
): [boolean, (value: boolean) => void] {
  const [value, setValue] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(storageKey);
      return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    }
    return defaultValue;
  });

  const setStoredValue = React.useCallback(
    (newValue: boolean) => {
      setValue(newValue);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(newValue));
      }
    },
    [storageKey]
  );

  return [value, setStoredValue];
}


export function ToggleButton({
  checked,
  onToggle,
  ...props
} : {
  checked: boolean;
  onToggle: (value: boolean) => void,
}) {
  // Listen for Command+K (Mac) or Ctrl+K (Windows/Linux) keyboard shortcut
  useEventListener('keydown', (event: KeyboardEvent) => {
    // Check for Command+K (Mac) or Ctrl+K (Windows/Linux)
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      onToggle(!checked)
    }
  })

  return (
    <div
      {...props} className="flex hidden md:flex"
      style={{
        justifyContent: 'space-around',
        backgroundColor: 'rgba(68,45,13,0.078)',
        borderRadius: 10,
        padding: 2,
        width: 68,
        height: 32,
      }}
      onClick={() => onToggle(!checked)}
    >

      <GetButton checked={checked} Icon={TableIcon}></GetButton>
      <GetButton checked={!checked} Icon={CardIcon}></GetButton>
    </div>
  )
}
