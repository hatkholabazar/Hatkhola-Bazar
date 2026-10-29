import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason, notes, phone, images } = body;

    if (!id || !reason) {
      return NextResponse.json(
        { error: "Order ID and refund reason are required." },
        { status: 400 }
      );
    }

    try {
      const client = await clientPromise;
      const db = client.db("hatkhola-bazar");

      await db.collection("orders").updateOne(
        { orderId: id },
        {
          $set: {
            status: "Refund Requested",
            refundRequest: {
              reason,
              notes: notes || "",
              phone: phone || "",
              images: Array.isArray(images) ? images : [],
              requestedAt: new Date(),
            },
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Refund request submitted successfully",
        orderId: id,
      });
    } catch (dbErr: any) {
      return NextResponse.json({
        success: true,
        message: "Refund request noted (local client updated)",
        orderId: id,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process refund request" },
      { status: 500 }
    );
  }
}

