import { redirect } from "next/navigation";

// hyperagent.com sends a signed-in user straight to the new-thread screen.
export default function Home() {
  redirect("/threads/new");
}
