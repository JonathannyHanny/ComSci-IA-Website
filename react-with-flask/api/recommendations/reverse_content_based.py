"""Reverse-content recommendations (tag popularity based).

Given a target item, this recommender returns items that share tags with
the target item and ranks them by how many tags they share. This is a
fast, interpretable approach suitable for small datasets.
"""

from collections import Counter


class ReverseContentBased:
    def __init__(self, items):
        self.items = {i['id']: i for i in items}
        self.tag_index = {}
        for iid, i in self.items.items():
            for t in i.get('tags', []):
                self.tag_index.setdefault(t, set()).add(iid)

    def similar_items_by_tag_popularity(self, item_id, top_n=10):
        # If the item does not exist, return an empty list to indicate no matches
        if item_id not in self.items:
            return []
        tags = self.items[item_id].get('tags', [])
        candidates = Counter()
        for t in tags:
            for cid in self.tag_index.get(t, []):
                if cid == item_id:
                    continue
                candidates[cid] += 1
        most = candidates.most_common(top_n)
        return [self.items[cid] for cid, _ in most]


if __name__ == '__main__':
    sample = [
        {'id': 1, 'name': 'A', 'tags': ['math', 'logic']},
        {'id': 2, 'name': 'B', 'tags': ['art', 'drawing']},
        {'id': 3, 'name': 'C', 'tags': ['math', 'algorithms']},
        {'id': 4, 'name': 'D', 'tags': ['math', 'logic']},
    ]
    r = ReverseContentBased(sample)
    print([i['id'] for i in r.similar_items_by_tag_popularity(1)])
