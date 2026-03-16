export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-transparent p-0 m-0 overflow-hidden">
      {children}
    </div>
  )
}
