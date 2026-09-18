import { ElementEventEmitter } from '../src/utils/eventEmitter';

describe('ElementEventEmitter getHistory', () => {
  let emitter: ElementEventEmitter;

  beforeEach(() => {
    emitter = new ElementEventEmitter();
  });

  it('returns all history when no filter provided', () => {
    emitter.emit('event1', { a: 1 });
    emitter.emit('event2', { b: 2 });
    emitter.emit('event3', { c: 3 });

    const history = emitter.getHistory();
    expect(history.length).toBe(3);
    expect(history[0].event).toBe('event1');
    expect(history[1].event).toBe('event2');
    expect(history[2].event).toBe('event3');
  });

  it('filters by exact event name', () => {
    emitter.emit('event1', { a: 1 });
    emitter.emit('event2', { b: 2 });
    emitter.emit('event1', { c: 3 });

    const history = emitter.getHistory('event1');
    expect(history.length).toBe(2);
    expect(history.every(e => e.event === 'event1')).toBe(true);
  });

  it('treats empty string as valid filter (not falsy)', () => {
    emitter.emit('', { empty: true });
    emitter.emit('event1', { a: 1 });

    const history = emitter.getHistory('');
    expect(history.length).toBe(1);
    expect(history[0].event).toBe('');
    expect(history[0].data).toEqual({ empty: true });
  });

  it('returns fresh copies that cannot mutate internal state', () => {
    emitter.emit('event1', { a: 1 });

    const history1 = emitter.getHistory();
    history1[0].event = 'mutated';

    const history2 = emitter.getHistory();
    expect(history2[0].event).toBe('event1');
  });

  it('filtered results are also fresh copies', () => {
    emitter.emit('event1', { a: 1 });

    const filtered = emitter.getHistory('event1');
    filtered[0].event = 'mutated';

    const filtered2 = emitter.getHistory('event1');
    expect(filtered2[0].event).toBe('event1');
  });

  it('empty string filter does not match all events', () => {
    emitter.emit('event1', { a: 1 });
    emitter.emit('event2', { b: 2 });

    const emptyFilter = emitter.getHistory('');
    const all = emitter.getHistory();

    expect(emptyFilter.length).toBe(0);
    expect(all.length).toBe(2);
  });

  it('returns empty array for non-existent event', () => {
    emitter.emit('event1', { a: 1 });

    const history = emitter.getHistory('nonexistent');
    expect(history.length).toBe(0);
  });

  it('history preserves original timestamps and data', () => {
    const before = Date.now();
    emitter.emit('event1', { a: 1 });
    const after = Date.now();

    const history = emitter.getHistory('event1');
    expect(history.length).toBe(1);
    expect(history[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(history[0].timestamp).toBeLessThanOrEqual(after);
    expect(history[0].data).toEqual({ a: 1 });
  });
});
