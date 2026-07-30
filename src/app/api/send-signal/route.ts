import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { type, topic, url } = await request.json();

    if (type === "ntfy") {
      if (!topic) {
        return NextResponse.json({ success: false, error: "Topic is required" }, { status: 400 });
      }

      // Send post request to ntfy.sh from the server to bypass browser CORS completely
      const res = await fetch(`https://ntfy.sh/${topic.trim()}`, {
        method: "POST",
        body: "Ich brauche dich gerade. Bitte melde dich bei mir oder komm vorbei. Ich finde keine Worte.",
        headers: {
          "Title": "Safe Space Signal ❤️",
          "Priority": "5", // Max priority (vibrates & sound)
          "Tags": "heart,rotating_light",
        },
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
