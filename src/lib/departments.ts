import type { Department } from "./types";

/**
 * 11개 부서 정의. 부서명이 바뀌면 여기만 수정하면 됩니다.
 * color는 부서 카드의 포인트 컬러로 사용됩니다.
 */
export const DEPARTMENTS: Department[] = [
  { id: "dept-01", name: "유아부", color: "#635bff" },
  { id: "dept-02", name: "유치부", color: "#8b5cf6" },
  { id: "dept-03", name: "유년부", color: "#06b6d4" },
  { id: "dept-04", name: "초등부", color: "#0ea5e9" },
  { id: "dept-05", name: "중등부", color: "#10b981" },
  { id: "dept-06", name: "고등부", color: "#f59e0b" },
  { id: "dept-07", name: "청년부", color: "#ef4444" },
  { id: "dept-08", name: "장년부", color: "#ec4899" },
  { id: "dept-09", name: "찬양팀", color: "#14b8a6" },
  { id: "dept-10", name: "교육부", color: "#6366f1" },
  { id: "dept-11", name: "행정팀", color: "#84cc16" },
];

export const DEPARTMENT_MAP: Record<string, Department> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, d])
);

export function getDepartmentName(id: string): string {
  return DEPARTMENT_MAP[id]?.name ?? "알 수 없음";
}
