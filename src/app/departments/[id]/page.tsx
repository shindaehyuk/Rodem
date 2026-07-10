import { DEPARTMENTS } from "@/lib/departments";
import { DepartmentDetail } from "@/components/department-detail";

export function generateStaticParams() {
  return DEPARTMENTS.map((d) => ({ id: d.id }));
}

export const dynamicParams = false;

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DepartmentDetail departmentId={id} />;
}
