import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";
import * as Dotenv from "dotenv";

interface PrimaryOffer {
  offerPrice: number | undefined;
  currency: string | undefined;
}

Dotenv.config();

const apiKey = process.env.NEXT_PUBLIC_SERP_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const params = {
      engine: "walmart",
      query: title, // Use 'query' instead of 'q'
      api_key: apiKey,
    };

    console.log("Request params:", params);

    const response = await getJson(params);

    console.log("Response from SerpAPI:", response);

    if (
      !response ||
      !response.organic_results ||
      response.organic_results.length === 0
    ) {
      return NextResponse.json(
        { message: "No results found" },
        { status: 404 }
      );
    }

    const results = response.organic_results[0]; // Assuming you're only interested in the first result

    const ProductTitle = results?.title || null;
    const ProductThumbnail = results?.thumbnail || null;
    const ProductDescription = results?.description || null;
    const ProductRating = results?.rating || null;
    const ProductPricing: PrimaryOffer = results?.primary_offer || null;

    return NextResponse.json(
      {
        title: ProductTitle,
        desc: ProductDescription,
        image: ProductThumbnail,
        pricing: ProductPricing,
        rating: ProductRating,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching data from SerpAPI:", error);
    return NextResponse.json(
      { message: "Error fetching data from SerpAPI", error: error },
      { status: 500 }
    );
  }
}
