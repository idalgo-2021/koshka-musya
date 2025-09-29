import {SVGProps} from "react";

export function TableIcon({fill = "#b2b2b2", ...props}: SVGProps<any>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill={fill} {...props}>
      <path d="M0 10h3v3H0zm5 0h8v3H5zM0 5h3v3H0zm5 0h8v3H5zM0 0h3v3H0zm5 0h8v3H5z"/>
    </svg>
  )
}
