'use client'

import { Link } from '@heroui/link';
import { button as buttonStyles } from '@heroui/theme';

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md dark:bg-gray-800 text-center">
        <h1 className="text-3xl font-bold">Check your inbox</h1>
        <div className="text-gray-600 dark:text-gray-400 space-y-4">
          <p>
            We've sent you a verification email. Please click the link in the email to verify your account.
          </p>
          <p>
            If you don't see the email, check your spam folder.
          </p>
        </div>
        
        <Link
          href="/auth/login"
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
            className: "mt-8"
          })}
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
} 