import  Link  from "next/link";
import { Button, buttonVariants } from '@/components/ui/button'
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Link className={cn(buttonVariants({variant: 'outline'}))} href={'/image-classification'}>Upload image</Link>
    </main>
  );
}
