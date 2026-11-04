import React from "react";
import { INITIAL_PRODUCTS } from "@/lib/seedData";

export function generateStaticParams() {
  return INITIAL_PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
