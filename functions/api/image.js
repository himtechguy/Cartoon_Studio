export async function onRequestGet(context) {
  try {
    const key = context.env.POLLINATIONS_API_KEY;

    if (!key) {
      return new Response(
        JSON.stringify({
          error: "POLLINATIONS_API_KEY is not configured."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const url = new URL(context.request.url);

    const prompt = url.searchParams.get("prompt");
    const ratio = url.searchParams.get("ratio") || "1:1";

    if (!prompt) {
      return new Response(
        JSON.stringify({
          error: "Missing prompt."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    let width = 1024;
    let height = 1024;

    if (ratio === "16:9") {
      width = 1280;
      height = 720;
    }

    if (ratio === "9:16") {
      width = 720;
      height = 1280;
    }

    const apiUrl =
      "https://gen.pollinations.ai/image/" +
      encodeURIComponent(prompt) +
      `?model=black-forest-labs/flux.1&width=${width}&height=${height}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${key}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();

      return new Response(
        JSON.stringify({
          error: "Image generation failed.",
          details: errorText
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ||
          "image/jpeg",
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {

    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
