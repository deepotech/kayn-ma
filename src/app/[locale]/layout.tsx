import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthContext";
import { FavoritesProvider } from "@/components/providers/FavoritesProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | كاين السيارات",
    default: "Cayn.ma | كاين السيارات"
  },
  description: "Clasifieds in Morocco",
  openGraph: {
    siteName: "كاين السيارات",
  }
};

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${inter.className} min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-50`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <FavoritesProvider>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </FavoritesProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

