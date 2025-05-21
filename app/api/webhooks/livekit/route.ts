import { headers } from "next/headers"
import { WebhookReceiver } from "livekit-server-sdk"

import { db } from "@/lib/db"

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
)

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = headers()
  const authorization = headerPayload.get("Authorization")

  console.log("Received LiveKit webhook:", { authorization, body })

  if (!authorization) {
    console.warn("No authorization header")
    return new Response("No authorization header", { status: 400 })
  }

  let event
  try {
    event = receiver.receive(body, authorization)
    console.log("Webhook event:", event)
  } catch (err) {
    console.error("Webhook verification failed:", err)
    return new Response("Invalid webhook signature", { status: 401 })
  }

  try {
    if (event.event === "ingress_started") {
      await db.stream.update({
        where: {
          ingressId: event.ingressInfo?.ingressId,
        },
        data: {
          isLive: true,
        },
      })
      console.log("Ingress started handled for:", event.ingressInfo?.ingressId)
    }

    if (event.event === "ingress_ended") {
      await db.stream.update({
        where: {
          ingressId: event.ingressInfo?.ingressId,
        },
        data: {
          isLive: false,
        },
      })
      console.log("Ingress ended handled for:", event.ingressInfo?.ingressId)
    }
  } catch (err) {
    console.error("DB update failed:", err)
    return new Response("Internal Server Error", { status: 500 })
  }

  return new Response("Webhook processed", { status: 200 })
}
