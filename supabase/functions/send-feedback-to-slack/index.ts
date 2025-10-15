import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  pageContext: string;
  feedback: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const feedbackData: FeedbackRequest = await req.json();
    console.log("Received feedback submission:", {
      context: feedbackData.pageContext,
    });

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
            text: `*From:* ${feedbackData.name}\n*Page:* ${feedbackData.pageContext}\n*Feedback:* ${feedbackData.feedback}`,
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

    console.log("Sending to Slack via Bot API...");
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
      console.error("Slack API error:", slackData);
      throw new Error(`Slack API error: ${slackData.error || "Unknown error"}`);
    }

    console.log("✅ Feedback sent to Slack successfully");
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
    console.error("Error in send-feedback-to-slack function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send feedback" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
