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

// useToggleWithStorage has been replaced with useResponsiveToggle
// Import useResponsiveToggle from '@/hooks/useResponsiveToggle' instead


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
