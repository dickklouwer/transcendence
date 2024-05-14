// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'My Homepage',
  description: 'Welcome to my homepage created with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="bg-blue-500 p-4">
      <h1 className="text-white text-3xl">My Site Header</h1>
    </header>
  );
}