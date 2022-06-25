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
    peek = () => this.isEmpty() ? null : this.head.value;

    /**
     * Returns whether the queue is empty.
     * @returns True if Empty, False otherwise.
     */
    isEmpty = () => !this.size;

    /**
     * Enqueues the value into the queue.
     * @param {any} value The value to enqueue.
     */
    enqueue = (value) => {
        const newNode = new Node(value);

        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        }
        this.tail.next = newNode;
        this.tail = newNode;
        this.size++;
    }

    /**
     * Removes and returns the last element in the queue.
     * @returns The last element.
     */
    dequeue = () => {
        if (!this.head) {
            return null;
        }
        const ret = this.head.value;
        this.head = this.head.next;

        if (!this.head) {
            this.tail = null;
        }
        this.size--;
        return ret;
    }
}

class Node {
    constructor(value, next = null) {
        this.value = value;
        this.next = next;
    }
}

module.exports = Queue;