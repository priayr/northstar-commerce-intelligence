import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basket",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
