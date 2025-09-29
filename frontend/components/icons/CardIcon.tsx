import {SVGProps} from "react";

export function CardIcon({fill = "#b2b2b2", ...props}: SVGProps<any>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill={fill} {...props}>
      <path d="M0 0h6v6H0zm7 0h6v6H7zm0 7h6v6H7zM0 7h6v6H0z"/>
    </svg>
  )
}
