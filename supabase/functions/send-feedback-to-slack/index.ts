import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  name: string;
  role: string;
  pageContext: string;
  feedback: string;
  priority: "Low" | "Medium" | "High";
  screenshot?: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const feedbackData: FeedbackRequest = await req.json();
    console.log("Received feedback submission:", {
      name: feedbackData.name,
      page: feedbackData.pageContext,
    });

    const webhookUrl =
      "https://hooks.slack.com/services/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";

    const priorityEmoji = {
      Low: "🟢",
      Medium: "🟡",
      High: "🔴",
    };

    const blocks: any[] = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎨 New Pattern Feedback Submitted!",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*From:*\n${feedbackData.name} (${feedbackData.role})`,
          },
          {
            type: "mrkdwn",
            text: `*Page:*\n${feedbackData.pageContext}`,
          },
          {
            type: "mrkdwn",
            text: `*Priority:*\n${priorityEmoji[feedbackData.priority]} ${feedbackData.priority}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Feedback:*\n${feedbackData.feedback}`,
        },
      },
    ];

    if (feedbackData.screenshot) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "📸 *Screenshot attached*",
        },
      });
    }

    blocks.push({
      type: "divider",
    });
    
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `🧭 _Design system auto-tag:_ \`${feedbackData.pageContext}\``,
        },
      ],
    });
    
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "✅ Acknowledge",
            emoji: true,
          },
          style: "primary",
          value: "acknowledge",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "❓ Need More Info",
            emoji: true,
          },
          value: "clarify",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "✔️ Resolved",
            emoji: true,
          },
          style: "primary",
          value: "resolved",
        },
      ],
    });

    const payload = {
      blocks,
      text:
        `New feedback from ${feedbackData.name} (${feedbackData.role})\n` +
        `Page: ${feedbackData.pageContext}\n` +
        `Priority: ${priorityEmoji[feedbackData.priority]} ${feedbackData.priority}\n\n` +
        `${feedbackData.feedback}` +
        (feedbackData.screenshot ? "\n\n[Note: screenshot captured in app]" : ""),
    };

    console.log("Sending to Slack webhook...");
    const slackResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      console.error("Slack webhook error:", {
        status: slackResponse.status,
        statusText: slackResponse.statusText,
        body: errorText,
      });
      throw new Error(`Slack API error: ${slackResponse.status}`);
    }

    console.log("Successfully sent to Slack");
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
