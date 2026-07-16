import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || input.trim().length < 3) {
      return NextResponse.json({ predictions: [] });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_MAPS_API_KEY is not set");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const url = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
    const params = new URLSearchParams({
      input,
      key: apiKey,
    });

    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();
    console.log(data);

    return NextResponse.json({
      predictions: data.predictions || [],
    });
  } catch (error) {
    console.error("Error in places autocomplete:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}
