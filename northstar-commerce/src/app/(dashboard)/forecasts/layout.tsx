import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forecasts",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
