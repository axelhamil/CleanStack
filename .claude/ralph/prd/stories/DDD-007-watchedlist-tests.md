# DDD-007: WatchedList Tests

## Story

**As a** ddd-kit maintainer
**I want** comprehensive tests for WatchedList<T>
**So that** collection change tracking works reliably

## Acceptance Criteria

- [x] Test list creation with initial items
- [x] Test `add(item)` - tracks new items
- [x] Test `remove(item)` - tracks removed items
- [x] Test `getNewItems()` - returns added items
- [x] Test `getRemovedItems()` - returns removed items
- [x] Test `getItems()` - returns current state
- [x] Test change detection logic
- [x] Coverage > 95% on WatchedList.ts (100%)

## Test Cases

```typescript
interface Item {
  id: string;
  name: string;
}

class ItemList extends WatchedList<Item> {
  compareItems(a: Item, b: Item): boolean {
    return a.id === b.id;
  }
}

describe('WatchedList', () => {
  describe('creation', () => {
    it('should create with initial items', () => {
      const items = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }];
      const list = new ItemList(items);
      expect(list.getItems()).toHaveLength(2);
    });

    it('should create empty list', () => {
      const list = new ItemList([]);
      expect(list.getItems()).toHaveLength(0);
    });
  });

  describe('add', () => {
    it('should add new item', () => {
      const list = new ItemList([]);
      list.add({ id: '1', name: 'A' });
      expect(list.getItems()).toHaveLength(1);
    });

    it('should track new items', () => {
      const list = new ItemList([{ id: '1', name: 'A' }]);
      list.add({ id: '2', name: 'B' });
      expect(list.getNewItems()).toHaveLength(1);
      expect(list.getNewItems()[0].id).toBe('2');
    });

    it('should not add duplicate', () => {
      const list = new ItemList([{ id: '1', name: 'A' }]);
      list.add({ id: '1', name: 'A Updated' });
      expect(list.getItems()).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('should remove existing item', () => {
      const items = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }];
      const list = new ItemList(items);
      list.remove({ id: '1', name: 'A' });
      expect(list.getItems()).toHaveLength(1);
    });

    it('should track removed items', () => {
      const items = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }];
      const list = new ItemList(items);
      list.remove({ id: '1', name: 'A' });
      expect(list.getRemovedItems()).toHaveLength(1);
      expect(list.getRemovedItems()[0].id).toBe('1');
    });

    it('should not track removal of newly added items', () => {
      const list = new ItemList([]);
      list.add({ id: '1', name: 'A' });
      list.remove({ id: '1', name: 'A' });
      expect(list.getNewItems()).toHaveLength(0);
      expect(list.getRemovedItems()).toHaveLength(0);
    });
  });

  describe('change detection', () => {
    it('should detect no changes when unchanged', () => {
      const list = new ItemList([{ id: '1', name: 'A' }]);
      expect(list.getNewItems()).toHaveLength(0);
      expect(list.getRemovedItems()).toHaveLength(0);
    });

    it('should handle add then remove of same item', () => {
      const list = new ItemList([{ id: '1', name: 'A' }]);
      list.add({ id: '2', name: 'B' });
      list.remove({ id: '2', name: 'B' });
      expect(list.getNewItems()).toHaveLength(0);
    });
  });
});
```

## Definition of Done

- [x] All test cases pass (43 tests)
- [x] Coverage > 95% (100%)
- [x] Edge cases covered
