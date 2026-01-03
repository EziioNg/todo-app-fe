export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div>Contact Header</div>
      {children}
      <div>Contact Footer</div>
    </>
  );
}