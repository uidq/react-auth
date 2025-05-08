import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "bg-transparent font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class" }}>
          <div className="relative flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full border-t border-subtle-border py-8">
              <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="md:col-span-1">
                    <Link href="/" className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white font-bold">A</span>
                      </div>
                      <span className="font-bold text-lg text-primary">Auth<span className="text-white">Base</span></span>
                    </Link>
                    <p className="text-text-secondary text-sm mb-4">
                      Modern authentication and user management system built with Next.js and Supabase.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Product</h3>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                      <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Resources</h3>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                      <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                      <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Legal</h3>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                      <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                      <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-subtle-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                  <p className="text-text-secondary text-sm">© {new Date().getFullYear()} AuthBase. All rights reserved.</p>
                  <div className="flex space-x-4 mt-4 md:mt-0">
                    <Link href={siteConfig.links.github} className="text-text-secondary hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
                      </svg>
                    </Link>
                    <Link href={siteConfig.links.discord} className="text-text-secondary hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
