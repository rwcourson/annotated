"use client";

import Link from "next/link";
import { LogOut, Plug, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/Avatar";
import { signOutAction } from "@/app/actions";

export default function UserMenu({
  username,
  name,
  image,
}: {
  username: string | null;
  name: string | null;
  image: string | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="avatar-action ml-1 rounded-full outline-none ring-zinc-900/15 ring-offset-2 ring-offset-white focus-visible:ring-2">
        <UserAvatar name={name} image={image} size={30} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {name ?? "Signed in"}
          {username && <span className="text-zinc-400"> · @{username}</span>}
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={username ? `/u/${username}` : "/feed"}>
            <User /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/connect">
            <Plug /> Connect extension
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOutAction()}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
