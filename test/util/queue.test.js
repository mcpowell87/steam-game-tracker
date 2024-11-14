import { expect } from "chai";
import Queue from "../../src/util/queue";

describe('Queue', () => {
    it('should successfully dequeue with one item', () => {
        const q = new Queue();
        q.enqueue(1);
        expect(q.dequeue()).to.be.equal(1);
    });
    it('should return null when dequeuing with 0 items', () => {
        const q = new Queue();
        expect(q.dequeue()).to.be.null;
    });
    it('should successfully dequeue multiple times', () => {
        const q = new Queue();
        q.enqueue(1);
        q.enqueue(2);
        q.enqueue(3);
        q.enqueue(4);
        q.dequeue();
        expect(q.dequeue()).to.be.equal(2);
    });
    it('should successfully dequeue', () => {
        const q = new Queue();
        q.enqueue(1);
        q.enqueue(2);
        q.enqueue(3);
        q.enqueue(4);
        expect(q.dequeue()).to.be.equal(1);
    });
    describe('isEmpty', () => {
        it('should successfully report an empty queue', () => {
            const q = new Queue();
            expect(q.isEmpty()).to.be.true;
        });
        it('should successfully report a non-empty queue', () => {
            const q = new Queue();
            q.enqueue(1)
            expect(q.isEmpty()).to.be.false;
        });
    });

    describe('peek', () => {
        it('should successfully peek the correct value', () => {
            const q = new Queue();
            q.enqueue(1);
            q.enqueue(2);
            q.enqueue(3);
            q.enqueue(4);
            expect(q.peek()).to.be.equal(1);
        });
        it('should successfully peek without removing', () => {
            const q = new Queue();
            q.enqueue(1);
            q.enqueue(2);
            q.enqueue(3);
            q.enqueue(4);
            q.peek();
            expect(q.dequeue()).to.be.equal(1);
        });
    })
    
});