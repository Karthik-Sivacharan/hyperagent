import { notFound } from "next/navigation";
import { roomBySlug } from "@/lib/mock/rooms";
import { RoomView } from "@/components/rooms/room-view";

export default async function RoomPage({ params }: PageProps<"/rooms/[slug]">) {
  const { slug } = await params;
  const room = roomBySlug(slug);
  if (!room) notFound();
  return <RoomView room={room} />;
}
