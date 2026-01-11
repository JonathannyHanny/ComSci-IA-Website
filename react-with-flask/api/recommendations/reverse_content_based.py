# Reverse content-based - finds activities sharing tags/competencies
# Ranks by overlap count - good for "try something new" suggestions

from collections import Counter


class ReverseContentBased:
    def __init__(self, items):
        self.items = {i['id']: i for i in items}
        self.tag_index = {}
        for iid, i in self.items.items():
            tags = list(i.get('tags', []) or [])
            comps = list(i.get('competencies', []) or [])
            for t in set(tags + comps):
                self.tag_index.setdefault(t, set()).add(iid)

    def similar_items_by_tag_popularity(self, item_id, top_n=10):
        # Find items sharing tags/competencies, ranked by overlap count
        # If the item doesn't exist, returns an empty list
        if item_id not in self.items:
            return []
        tags = list(self.items[item_id].get('tags', []) or []) + list(self.items[item_id].get('competencies', []) or [])
        candidates = Counter()
        for t in tags:
            for cid in self.tag_index.get(t, []):
                if cid == item_id:
                    continue
                candidates[cid] += 1
        most = candidates.most_common(top_n)
        return [self.items[cid] for cid, _ in most]
