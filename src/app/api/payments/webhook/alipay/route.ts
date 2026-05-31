import { handleItxtWebhook } from "../itxt-handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleItxtWebhook(request, "alipay");
}
