import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";
import { RegisterSchemaType } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await registerUser(body as RegisterSchemaType);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          issues: result.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: result.user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while creating your account.",
        issues: {},
      },
      { status: 500 }
    );
  }
}
