export async function onRequestPost(context) {
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

    const body = await context.request.json();

    const prompt = body.prompt;
    const duration = Number(body.duration || 4);

    if (!prompt) {
      return new Response(
        JSON.stringify({
          error: "Missing video prompt."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const url =
      "https://gen.pollinations.ai/video/" +
      encodeURIComponent(prompt) +
      `?model=google/veo-3.1-fast&duration=${duration}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${key}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();

      return new Response(
        JSON.stringify({
          error: "Video generation failed.",
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

    const contentType =
      response.headers.get("Content-Type") || "";

    if (contentType.includes("video")) {
      return new Response(
        JSON.stringify({
          url: response.url
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const result = await response.json();

    const videoUrl =
      result?.data?.[0]?.url ||
      result?.url;

    if (!videoUrl) {
      return new Response(
        JSON.stringify({
          error: "No video URL returned.",
          result
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        url: videoUrl
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

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
