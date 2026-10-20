import { notFound } from "next/navigation";

/** Any unknown URL under /en or /ur renders the localized 404 inside the site layout. */
export default function CatchAll() {
  notFound();
}
