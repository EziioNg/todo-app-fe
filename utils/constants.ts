export const API_ROOT = process.env.NEXT_PUBLIC_API_ROOT;

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}
