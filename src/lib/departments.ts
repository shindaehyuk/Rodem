import type { Department } from "./types";

/**
 * 12개 부서 정의. 부서명이 바뀌면 여기만 수정하면 됩니다.
 * color는 부서 카드의 포인트 컬러로 사용됩니다.
 */
export const DEPARTMENTS: Department[] = [
  { id: "dept-01", name: "믿음부", color: "#e02424" },
  { id: "dept-02", name: "소망부", color: "#f0762b" },
  { id: "dept-03", name: "사랑부", color: "#f0e13c" },
  { id: "dept-04", name: "은혜부", color: "#8ed14f" },
  { id: "dept-05", name: "진리부", color: "#43b649" },
  { id: "dept-06", name: "충성부", color: "#1f6fc0" },
  { id: "dept-07", name: "지혜부", color: "#c7a5de" },
  { id: "dept-08", name: "영광부", color: "#f07f9b" },
  { id: "dept-09", name: "선행부", color: "#f6c3ce" },
  { id: "dept-10", name: "겸손부", color: "#cbe6bd" },
  { id: "dept-11", name: "성결부", color: "#bfe2ee" },
  { id: "dept-12", name: "하나부", color: "#0d9488" },
];

export const DEPARTMENT_MAP: Record<string, Department> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, d])
);

export function getDepartmentName(id: string): string {
  return DEPARTMENT_MAP[id]?.name ?? "알 수 없음";
}
