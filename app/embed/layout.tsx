export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            'html,body{margin:0;padding:0;background:transparent!important;min-height:0!important;height:auto!important;overflow:hidden!important;}',
        }}
      />
      <div className="min-h-0 bg-transparent p-0 m-0 overflow-visible">
        {children}
      </div>
    </>
  )
}
