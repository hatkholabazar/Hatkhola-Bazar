import type { Metadata } from "next";
import Unauthorized from "../unauthorized";

export const metadata: Metadata = {
  title: "Authentication Required | Hatkhola Bazar",
  description: "Please sign in to access your Hatkhola Bazar account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnauthorizedPage() {
  return <Unauthorized />;
}

