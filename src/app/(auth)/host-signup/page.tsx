import type { Metadata } from 'next';
import { SignupForm } from '../signup/signup-form';

export const metadata: Metadata = {
  title: 'List your venue — Cenit',
  description: 'Create a host account to manage your venue on Cenit.',
};

export default function HostSignupPage() {
  return <SignupForm host />;
}
