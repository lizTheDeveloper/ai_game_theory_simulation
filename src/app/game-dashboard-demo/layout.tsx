/**
 * Game-specific layout - NO simulation navigation sidebar
 *
 * This overrides the root layout for the game dashboard demo,
 * providing a clean, full-screen game experience without the
 * simulation research tool UI.
 */

export default function GameLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
