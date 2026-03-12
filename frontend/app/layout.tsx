import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Scheduling Platform',
  description: 'A simplified scheduling platform',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
