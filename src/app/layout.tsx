// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Pong Game',
  description: 'Retro Pong Game - ft_transcendence42',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
      </head>
      <body className='flex flex-col min-h-screen'>
        <Header></Header>
        <main className="flex-grow flex items-center justify-center">{children}</main>
        <Footer></Footer>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="Pong Header - Transcendence blue">
      <h1 className="text-white text-3xl">PONG!</h1>
    </header>
  );
}

function Footer() {
  const subtextStyle = {
    color: 'white',
    textAlign: 'left',
    fontSize: '12px',
  };

  return (
    <footer style={{ backgroundColor: 'blue', padding: '16px', marginTop: '32px' }}>
    <p style={subtextStyle}>ft_transcendence42 a Codam project.
    <br />
    Created and styled by: tklouwer, bprovoos, jmeruma, vbrouwer, mweverli.
    </p>
    </footer>
);
}