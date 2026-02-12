import { MyTicketsClient } from './my-tickets-client';

export function generateStaticParams() {
  return [{ lang: 'en' }];
}

export default function MyTicketsPage() {
  return <MyTicketsClient />;
}
