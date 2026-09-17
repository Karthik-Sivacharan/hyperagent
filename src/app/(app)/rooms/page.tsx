import { rooms } from "@/lib/mock/rooms";
import { RoomsDirectory } from "@/components/rooms/rooms-directory";

export default function Page() {
  return <RoomsDirectory rooms={rooms} />;
}
