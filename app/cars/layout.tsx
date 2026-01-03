export default function CarsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="flex items-center justify-center text-2xl text-red-400">
        Cars Header
      </div>
      {children}
      <div className="flex items-center justify-center text-2xl text-red-400">
        Cars Footer
      </div>
    </>
  );
}
