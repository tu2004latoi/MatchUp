import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  className?: string;
}>;

export default function Container({ className, children }: Props) {
  return <div className={className}>{children}</div>;
}
