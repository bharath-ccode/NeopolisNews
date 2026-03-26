import clsx from "clsx";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  tight?: boolean;
}

export default function SectionWrapper({
  children,
  className,
  id,
  tight,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={clsx(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        tight ? "py-8 md:py-12" : "py-12 md:py-20",
        className
      )}
    >
      {children}
    </section>
  );
}
