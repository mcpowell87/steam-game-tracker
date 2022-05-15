class Queue {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    /**
     * Returns but does not remove the last element in the queue.
     * @returns The last element.
     */
    peek = () => this.isEmpty() ? null : this.tail.value;

    /**
     * Returns whether the queue is empty.
     * @returns True if Empty, False otherwise.
     */
    isEmpty = () => !this.tail;

    /**
     * Enqueues the value into the queue.
     * @param {any} value The value to enqueue.
     */
    enqueue = (value) => {
        const newHead = new Node(value);

        newHead.next = this.head;
        newHead.prev = null;

        if (this.head) {
            this.head.prev = newHead;
        }

        if (!this.tail) {
            this.tail = newHead;
        }

        this.head = newHead;
        this.size += 1;
    }

    /**
     * Removes and returns the last element in the queue.
     * @returns The last element.
     */
    dequeue = () => {
        if (!this.tail) {
            return null;
        }
        const ret = this.tail.value;

        if (this.tail === this.head) {
            this.head === null;
            this.tail === null;
        } else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }

        this.size -= 1;

        return ret;
    }
}

class Node {
    constructor(value, next = null, prev = null) {
        this.value = value;
        this.next = next;
        this.prev = prev
    }
}

module.exports = Queue;