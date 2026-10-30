import type { Metadata } from "next";
import Forbidden from "../forbidden";

export const metadata: Metadata = {
  title: "Access Denied | Hatkhola Bazar",
  description: "Protected area. You do not have permission to view this page.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccessDeniedPage() {
  return <Forbidden />;
}

