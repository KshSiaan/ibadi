import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { place_id } = await request.json();

    if (!place_id) {
      return NextResponse.json(
        { error: "place_id is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_MAPS_API_KEY is not set");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const url = "https://maps.googleapis.com/maps/api/place/details/json";
    const params = new URLSearchParams({
      place_id,
      key: apiKey,
      fields: "geometry,formatted_address",
    });

    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Google Places API error:", data.status, data.error_message);
      return NextResponse.json(
        { error: "Failed to get place details" },
        { status: 500 }
      );
    }

    return NextResponse.json(data.result);
  } catch (error) {
    console.error("Error in place details:", error);
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    );
  }
}
