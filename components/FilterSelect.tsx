"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface FilterSelectProps {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  className?: string;
}

export function FilterSelect({
  name,
  defaultValue,
  options,
  className,
}: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    // Reset to page 1 when filter changes
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      name={name}
      defaultValue={defaultValue}
      onChange={handleChange}
      className={className}
    >
      {options.map((option, index) => (
        <option key={`${option.value}-${index}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

