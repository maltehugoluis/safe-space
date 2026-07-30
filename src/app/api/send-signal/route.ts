import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { type, topic, url } = await request.json();

    if (type === "ntfy") {
      if (!topic) {
        return NextResponse.json({ success: false, error: "Topic is required" }, { status: 400 });
      }

      // Send parameters as query string parameters. Emojis and other non-ASCII characters
      // in HTTP headers throw a TypeError (ERR_INVALID_CHAR) in Node.js undici/fetch.
      const queryParams = new URLSearchParams({
        title: "Safe Space Signal ❤️",
        priority: "5",
        tags: "heart,rotating_light",
      });

      const res = await fetch(`https://ntfy.sh/${topic.trim()}?${queryParams.toString()}`, {
        method: "POST",
        body: "Ich brauche dich gerade. Bitte melde dich bei mir oder komm vorbei. Ich finde keine Worte.",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`ntfy server responded with ${res.status}: ${text}`);
      }
    } else if (type === "webhook") {
      if (!url) {
        return NextResponse.json({ success: false, error: "Webhook URL is required" }, { status: 400 });
      }

      let bodyData = {};
      if (url.includes("discord.com/api/webhooks")) {
        bodyData = {
          content: "❤️ **Signal aus deinem Safe Space:**\nIch brauche dich gerade. Bitte melde dich bei mir oder komm zu mir. Ich finde gerade keine Worte.",
        };
      } else if (url.includes("api.telegram.org")) {
        bodyData = {
          text: "❤️ Signal aus deinem Safe Space: Ich brauche dich gerade. Bitte melde dich bei mir.",
        };
      } else {
        bodyData = {
          event: "safe_space_signal",
          message: "Ich brauche dich gerade. Bitte melde dich bei mir.",
          timestamp: new Date().toISOString(),
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Webhook server responded with ${res.status}: ${text}`);
      }
    } else {
      return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending signal:", error);
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
  }
}
