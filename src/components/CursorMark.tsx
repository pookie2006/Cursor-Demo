type CursorMarkProps = {
  className?: string
}

/**
 * Crisp vector of Cursor’s circular app mark (official brand path geometry):
 * black disc, cream isometric cube, black cursor as negative space.
 */
export function CursorMark({ className }: CursorMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      <circle cx="200" cy="200" r="200" fill="#14120B" />
      {/* Official 2D cube+cursor path, translated from the brand kit’s 600×300 origin. */}
      <path
        fill="#EDECEC"
        fillRule="evenodd"
        d="M314.009 128.708L205.624 66.13C202.142 64.121 197.847 64.121 194.37 66.13L85.99 128.708C83.066 130.395 81.261 133.523 81.261 136.903V263.087C81.261 266.472 83.066 269.595 85.99 271.282L194.376 333.86C197.857 335.869 202.153 335.869 205.629 333.86L314.015 271.282C316.939 269.595 318.744 266.467 318.744 263.087V136.903C318.744 133.518 316.939 130.395 314.015 128.708H314.009ZM307.201 141.964L202.571 323.19C201.864 324.412 199.995 323.914 199.995 322.5V203.835C199.995 201.463 198.725 199.272 196.674 198.083L93.907 138.751C92.686 138.044 93.184 136.174 94.598 136.174H303.864C306.837 136.174 308.696 139.393 307.207 141.97L307.201 141.964Z"
      />
    </svg>
  )
}
