export const moveStatus = <T extends { status: string }>(row: T, status: string): T => ({ ...row, status });
