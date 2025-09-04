import { NextRequest, NextResponse } from "next/server";
import {  getSession } from "./lib/session";

export async function middleware(request: NextRequest) {
  console.log("MOHAN1", request.url);
  const session = await getSession();
  // const session = await getSessionFromMiddleware(request);
  console.log("MOHAN2", session);

  if (!session || !session.user)
    return NextResponse.redirect(new URL("/auth/signin", request.url));
}

export const config = {
  matcher: "/user/:path*",
};
