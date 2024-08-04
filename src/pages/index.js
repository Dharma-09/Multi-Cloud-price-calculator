import Image from "next/image";
import { Inter } from "next/font/google";
import { Component } from "@/components/component";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <Component></Component>
    </main>
  );
}
