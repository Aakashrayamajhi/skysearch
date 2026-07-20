class MinHeap {
  constructor(k) {
    this.k = k;
    this.heap = [];
  }

  push(item) {
    if (this.heap.length < this.k) {
      this.heap.push(item);
      this._bubbleUp();
    } else if (item.score > this.heap[0].score) {
      this.heap[0] = item;
      this._sinkDown();
    }
  }

  _bubbleUp() {
    let i = this.heap.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.heap[p].score <= this.heap[i].score) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  _sinkDown() {
    let i = 0;
    const n = this.heap.length;

    while (true) {
      let left = 2 * i + 1;
      let right = 2 * i + 2;
      let smallest = i;

      if (left < n && this.heap[left].score < this.heap[smallest].score) {
        smallest = left;
      }
      if (right < n && this.heap[right].score < this.heap[smallest].score) {
        smallest = right;
      }

      if (smallest === i) break;

      [this.heap[i], this.heap[smallest]] =
        [this.heap[smallest], this.heap[i]];

      i = smallest;
    }
  }

  getSorted() {
    return this.heap.sort((a, b) => b.score - a.score);
  }
}

module.exports = MinHeap;