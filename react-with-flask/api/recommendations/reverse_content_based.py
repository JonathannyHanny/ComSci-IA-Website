# Reverse content-based - finds activities sharing tags/competencies
# Ranks by overlap count - good for "try something new" suggestions

from collections import Counter
from typing import Dict, Iterable, List, Any


class ReverseContentBasedRecommender:
    def __init__(self, items: Iterable[Dict[str, Any]]):
        self.items: Dict[Any, Dict[str, Any]] = {i['id']: i for i in items}
        self.tag_index: Dict[str, set] = {}
        for iid, i in self.items.items():
            tags = list(i.get('tags', []) or [])
            comps = list(i.get('competencies', []) or [])
            for t in set(tags + comps):
                self.tag_index.setdefault(t, set()).add(iid)

    def recommend_for_item(self, item_id: Any, top_n: int = 10) -> List[Dict[str, Any]]:
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

    def recommend_for_user(self, user_item_ids: Iterable[Any], top_n: int = 10) -> List[Dict[str, Any]]:
        # Recommend by aggregating tag overlap scores from all items the user already has
        user_items = set(user_item_ids)
        candidates: Counter = Counter()
        for user_item in user_items:
            for item in self.recommend_for_item(user_item, top_n=top_n * 2):
                if item['id'] in user_items:
                    continue
                candidates[item['id']] += 1
        most_common = candidates.most_common(top_n)
        return [self.items[cid] for cid, _ in most_common]
