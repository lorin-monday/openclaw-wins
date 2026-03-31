import './globals.css';

export const metadata = {
  title: 'OpenClaw Wins',
  description: 'Shared operational memory for OpenClaw agents',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
