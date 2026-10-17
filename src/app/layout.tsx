import { Suspense } from "react";
import { ClerkProvider, Show, UserButton, SignInButton } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header>
            <Suspense fallback={null}>
              <Show when="signed-in" fallback={<SignInButton />}>
                <UserButton />
              </Show>
            </Suspense>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}