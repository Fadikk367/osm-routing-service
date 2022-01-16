import { PriorityQueue } from "./types";

class ArrayQueue<T extends { id: number }> implements PriorityQueue<T> {
  private data: [T, number][];
  
  constructor() {
    this.data = [];
  }

  isNotEmpty(): boolean {
    return this.data.length !== 0;
  }

  add(item: T, priority: number): void {
    this.data.push([item, priority]);
  }

  pop(): [T, number] {  
    let minIndex = 0;
    for (let i = 1; i < this.data.length; i++) {
      if (this.data[i][1] < this.data[minIndex][1]) {
        minIndex = i;
      }
    }
  
    return this.data.splice(minIndex, 1)[0];
  }

  decreasePriority(item: T, newPriority: number): void {
    const v = this.data.find(([e, _]) => e.id === item.id);
    if (v) {
      v[1] = newPriority;
    }
  }
}

export default ArrayQueue;