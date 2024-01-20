import  Link  from "next/link";
import { Button } from '@/components/ui/button'
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Link href={'/image/classification'}>Upload image</Link>
    </main>
  );
}
