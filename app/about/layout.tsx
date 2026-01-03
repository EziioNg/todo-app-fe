export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex items-center justify-center text-2xl text-red-400">
        About Header
      </div>
      {children}
      <div className="flex items-center justify-center text-2xl text-red-400">
        About Footer
      </div>
    </>
  );
}
