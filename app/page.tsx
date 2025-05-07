'use client';

import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex flex-col bg-transparent">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-20 md:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Secure Authentication</span>
              <br />
              <span className="text-white">for Modern Applications</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-8">
              A complete authentication solution with login, registration, and user management powered by Supabase.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className={buttonStyles({
                  color: "primary",
                  radius: "full",
                  variant: "shadow",
                  className: "px-8 py-2 text-base btn-hover"
                })}
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className={buttonStyles({
                  variant: "bordered",
                  radius: "full",
                  className: "px-8 py-2 text-base border-subtle-border hover:bg-card-hover"
                })}
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Featured Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto max-w-5xl mt-16"
          >
            <div className="border-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col justify-center">
                  <h2 className="text-2xl font-bold mb-4">Complete Authentication Flow</h2>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span>Secure login with email & password</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span>Email verification flow</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span>Protected dashboard area</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span>Supabase database integration</span>
                    </li>
                  </ul>
                </div>
                <div className="flex items-center justify-center">
                  <div className="card-effect p-4 w-full max-w-md">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="flex-1 text-center text-sm text-muted">Authentication Demo</div>
                      </div>
                      <div className="bg-card-background p-4 rounded-md">
                        <div className="space-y-3">
                          <div className="h-8 bg-card-hover rounded-md w-2/3"></div>
                          <div className="h-8 bg-card-hover rounded-md"></div>
                          <div className="h-8 bg-card-hover rounded-md"></div>
                          <div className="h-10 bg-primary rounded-md"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Everything you need to implement authentication in your application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Easy Authentication",
                description: "Simple and secure authentication with Supabase Auth services and session management.",
                icon: (
                  <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              },
              {
                title: "Modern UI Components",
                description: "Beautiful and responsive UI components built with HeroUI and TailwindCSS.",
                icon: (
                  <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              },
              {
                title: "User Management",
                description: "Complete user management with profile data, authentication status, and session control.",
                icon: (
                  <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13M16 3.13C17.7699 3.58317 19.0078 5.17885 19.0078 7.005C19.0078 8.83115 17.7699 10.4268 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-effect p-6"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="border-card p-8 max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-text-secondary max-w-2xl mx-auto mb-8">
              Start building your application with our secure authentication system today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className={buttonStyles({
                  color: "primary",
                  radius: "full",
                  variant: "shadow",
                  className: "px-8 py-2 text-base btn-hover"
                })}
              >
                Create Account
              </Link>
              <Link
                href="/docs"
                className={buttonStyles({
                  variant: "bordered",
                  radius: "full",
                  className: "px-8 py-2 text-base border-subtle-border hover:bg-card-hover"
                })}
              >
                View Documentation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
