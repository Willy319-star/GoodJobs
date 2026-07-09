import Image from "next/image";
import { cn } from "@/lib/utils";

type GoodJobsLogoMarkProps = {
  className?: string;
  iconClassName?: string;
};

export function GoodJobsLogoMark({ className, iconClassName }: GoodJobsLogoMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center",
        className,
      )}
      aria-hidden="true"
    >
      <Image
        src="/goodjobs-logo.svg"
        alt=""
        width={254}
        height={237}
        priority
        className={cn("size-10 object-contain", iconClassName)}
      />
    </span>
  );
}
