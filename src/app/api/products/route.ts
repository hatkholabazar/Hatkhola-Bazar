import { NextResponse } from "next/server";
import { client } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = client.db();
    const rawProducts = await db
      .collection("products")
      .find({ isActive: { $ne: false } })
      .sort({ createdAt: 1 })
      .toArray();

    const products = rawProducts.map((p) => {
      const mode = p.availabilityMode || "in_stock";

      return {
        id: p._id.toString(),
        code: p.code,
        slug: p.slug,
        name: p.name,
        availabilityMode: mode,
        preOrder:
          mode === "pre_order" && p.preOrder
            ? {
                expectedDate: p.preOrder.expectedDate,
                expectedNote: p.preOrder.expectedNote,
                depositRequired: Boolean(p.preOrder.depositRequired),
                depositAmount: p.preOrder.depositAmount,
                depositPercent: p.preOrder.depositPercent,
                cancellationPolicyText: p.preOrder.cancellationPolicyText,
              }
            : undefined,
        sellingOptions: (p.sellingOptions || []).map((o: any) => ({
          label: o.label,
          qtyG: o.qtyG,
          sellingPrice: o.sellingPrice,
        })),
        isSeasonal: Boolean(p.isSeasonal),
        description: p.description || "",
        tagline: p.tagline || "",
        badge: p.badge || "",
        origin: p.origin || "",
        benefits: p.benefits || [],
        image: p.image || "/ghee-pic.webp",
      };
    });

    return NextResponse.json(
      { success: true, products },
      {
        headers: {
          "Cache-Control":
            "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch products from database", message: err.message },
      { status: 500 }
    );
  }
}

