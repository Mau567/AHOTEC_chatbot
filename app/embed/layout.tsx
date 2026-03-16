export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: 'html, body { background: transparent !important; min-height: 0; }' }} />
      <div className="min-h-0 bg-transparent p-0 m-0 overflow-hidden">
        {children}
      </div>
    </>
  )
}
