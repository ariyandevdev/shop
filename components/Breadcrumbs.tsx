import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItemData {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItemData[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="container mx-auto p-4">
      <Breadcrumb className="mb-6 px-4">
        <BreadcrumbList>
          {items.map((item, index) => (
            <div key={item.href} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === items.length - 1 ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
