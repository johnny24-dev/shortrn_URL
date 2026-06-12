import { env } from "@/lib/env";

export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type MailProviderConfig = {
  provider: "resend" | "postmark";
  apiKey: string;
  from: string;
  fetchImpl?: typeof fetch;
};

export function createMailProvider(config: MailProviderConfig) {
  const fetchImpl = config.fetchImpl ?? fetch;

  return {
    async send(input: SendMailInput) {
      if (config.provider === "resend") {
        return fetchImpl("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: config.from,
            to: input.to,
            subject: input.subject,
            text: input.text,
            html: input.html,
          }),
        });
      }

      return fetchImpl("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Postmark-Server-Token": config.apiKey,
        },
        body: JSON.stringify({
          From: config.from,
          To: input.to,
          Subject: input.subject,
          TextBody: input.text,
          HtmlBody: input.html,
        }),
      });
    },
  };
}

export async function sendMail(input: SendMailInput) {
  if (env.EMAIL_PROVIDER === "resend") {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
    }

    return createMailProvider({
      provider: "resend",
      apiKey: env.RESEND_API_KEY,
      from: env.MAIL_FROM ?? "Shortly <noreply@example.com>",
    }).send(input);
  }

  if (env.EMAIL_PROVIDER === "postmark") {
    if (!env.POSTMARK_API_TOKEN) {
      throw new Error("POSTMARK_API_TOKEN is required when EMAIL_PROVIDER=postmark");
    }

    return createMailProvider({
      provider: "postmark",
      apiKey: env.POSTMARK_API_TOKEN,
      from: env.MAIL_FROM ?? "Shortly <noreply@example.com>",
    }).send(input);
  }

  throw new Error("EMAIL_PROVIDER must be set to resend or postmark");
}
