import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Orb from "./Orb";
import UserMenu from "./UserMenu";
import NavFrame from "./NavFrame";

export default async function Nav() {
  const session = await auth();
  const me = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { username: true, name: true, image: true },
      })
    : null;

  return (
    <NavFrame>
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)] focus-visible:ring-offset-4"
        >
          <Orb size={20} className="transition-transform duration-300 ease-out group-hover:rotate-12 group-hover:scale-105" />
          <span className="text-[15px] font-semibold tracking-[-0.03em] text-[var(--ink)] transition-colors duration-150 group-hover:text-[var(--action-dark)]">
            annotated
          </span>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/feed">Discover</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
            <Link href="/#how-it-works">How it works</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href="/feed">Annotations</Link>
          </Button>

          {me ? (
            <UserMenu
              username={me.username}
              name={me.name}
              image={me.image}
            />
          ) : (
            <Button size="sm" asChild className="ml-1">
              <Link href="/connect">Get the extension</Link>
            </Button>
          )}
        </div>
    </NavFrame>
  );
}
