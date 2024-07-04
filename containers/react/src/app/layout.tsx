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
        <body className='relative flex-grow flex-col min-h-screen w-full'>
          <main className="flex-grow flex items-center justify-center">{children}</main>
          <Footer></Footer>
        </body>
      </html>
  );
}



function Footer() {
  const subtextStyle = {
    color: 'white',
    textAlign: 'left',
    fontSize: '12px',
  };

  return (
    <div className='w-full'>
      <footer className=' bg-blue-600 text-white p-4 mt-auto'>
      <p>ft_transcendence42 a Codam project.
      <br />
      Created and styled by: tklouwer, bprovoos, jmeruma, vbrouwer, mweverli.
      </p>
      </footer>
    </div>
);
}