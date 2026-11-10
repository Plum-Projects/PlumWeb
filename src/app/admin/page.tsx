import { notFound } from 'next/navigation';

// Security honeypot: The admin panel has been moved to a protected, secret route.
// Any request reaching this page triggers an immediate 404 Not Found.
export default function AdminHoneypot() {
  notFound();
}
