import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const feedbackSchema = z.object({
  pageContext: z.string().trim().max(500),
  feedback: z.string().trim().min(1).max(5000),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const rawData = await req.json();
    const feedbackData = feedbackSchema.parse(rawData);

    console.log("Feedback submission received");

    const botToken = Deno.env.get("SLACK_BOT_TOKEN");
    const channelId = Deno.env.get("SLACK_CHANNEL_ID");

    if (!botToken || !channelId) {
      throw new Error("Missing Slack configuration");
    }

    const payload = {
      channel: channelId,
      text: "*New Feedback Submitted* 🧠",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*From:* Anonymous user\n*Page:* ${feedbackData.pageContext}\n*Feedback:* ${feedbackData.feedback}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Submitted from Lovable Feedback Bubble",
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "✔️ Resolved",
                emoji: true,
              },
              style: "primary",
              value: "resolved",
              action_id: "resolve_feedback",
            },
          ],
        },
      ],
    };

    const slackResponse = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${botToken}`,
      },
      body: JSON.stringify(payload),
    });

    const slackData = await slackResponse.json();
    
    if (!slackResponse.ok || !slackData.ok) {
      throw new Error(`Slack API error: ${slackData.error || "Unknown error"}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Feedback sent to Slack" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    // Handle validation errors
    if (error.name === "ZodError") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid input data" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to send feedback" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
