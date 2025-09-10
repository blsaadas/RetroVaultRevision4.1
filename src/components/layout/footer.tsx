export function AppFooter() {
  return (
    <footer className="border-t">
      <div className="container py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} RetroVault. All rights reserved.</p>
      </div>
    </footer>
  );
}
