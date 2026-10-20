// Centered page container with consistent horizontal padding.
export function Container({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
}
