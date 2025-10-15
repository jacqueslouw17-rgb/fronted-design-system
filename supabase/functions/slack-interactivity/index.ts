import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Verify Slack request signature for security
async function verifySlackSignature(
  body: string,
  timestamp: string,
  signature: string,
  signingSecret: string
): Promise<boolean> {
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  const requestTimestamp = parseInt(timestamp);

  if (requestTimestamp < fiveMinutesAgo) {
    console.error("Request timestamp is too old");
    return false;
  }

  const sigBasestring = `v0:${timestamp}:${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(sigBasestring)
  );

  const computedSignature =
    "v0=" +
    Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  return computedSignature === signature;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signingSecret = Deno.env.get("SLACK_SIGNING_SECRET");
    if (!signingSecret) {
      throw new Error("Missing SLACK_SIGNING_SECRET");
    }

    // Get Slack signature headers
    const slackSignature = req.headers.get("x-slack-signature");
    const slackTimestamp = req.headers.get("x-slack-request-timestamp");
    const body = await req.text();

    // Verify the request is from Slack
    if (slackSignature && slackTimestamp) {
      const isValid = await verifySlackSignature(
        body,
        slackTimestamp,
        slackSignature,
        signingSecret
      );

      if (!isValid) {
        console.error("Invalid Slack signature");
        return new Response("Unauthorized", { status: 401 });
      }
    }

    // Parse the payload from form data
    const params = new URLSearchParams(body);
    const payloadString = params.get("payload");

    if (!payloadString) {
      throw new Error("No payload found in request");
    }

    const payload = JSON.parse(payloadString);
    console.log("Received Slack interaction:", payload.type);

    const { actions, response_url } = payload;

    // Check if user clicked "Resolved"
    if (actions && actions[0]?.value === "resolved") {
      console.log("Resolving feedback and deleting message...");

      // Delete the original message
      const deleteResponse = await fetch(response_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delete_original: true,
          text: "✅ Feedback marked as resolved and removed.",
        }),
      });

      if (!deleteResponse.ok) {
        console.error("Failed to delete message:", await deleteResponse.text());
      } else {
        console.log("✅ Feedback message deleted successfully");
      }
    }

    // Respond immediately to Slack (required within 3 seconds)
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Error in slack-interactivity function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
