import {isServer} from "@/lib/browser";

export const vibrateShort = () => {
  if (!isServer) {
    navigator.vibrate?.(30)
  }
}
