export interface PriorityQueue<T extends { id: number }> {
  add(item: T, priority: number): void;
  pop(): [T, number];
  decreasePriority(item: T, newPriority: number): void;
  isNotEmpty(): boolean;
}
