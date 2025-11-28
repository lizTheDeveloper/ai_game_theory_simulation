#!/usr/bin/env python3
"""
Code Licensing Training Dataset Generator

Generates synthetic code samples with various licenses for training
the Code Attribution Agent.

Includes:
- MIT, Apache 2.0, GPL 2.0/3.0, AGPL 3.0, BSD 2/3-Clause, ISC
- Proper attribution examples
- License violation examples
- Copy-paste plagiarism examples
- Refactored plagiarism examples

Author: Marcus (Platform Engineer)
Date: 2025-11-17
"""

import json
import random
from dataclasses import dataclass, asdict
from typing import List, Dict
from pathlib import Path


# License header templates
LICENSE_HEADERS = {
    "MIT": """
# MIT License
#
# Copyright (c) {year} {author}
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
""",

    "Apache-2.0": """
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Copyright (c) {year} {author}
""",

    "GPL-2.0": """
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# Copyright (C) {year} {author}
""",

    "GPL-3.0": """
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Copyright (C) {year} {author}
""",

    "AGPL-3.0": """
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Copyright (C) {year} {author}
""",

    "BSD-2-Clause": """
# Copyright (c) {year}, {author}
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# 1. Redistributions of source code must retain the above copyright notice,
#    this list of conditions and the following disclaimer.
# 2. Redistributions in binary form must reproduce the above copyright notice,
#    this list of conditions and the following disclaimer in the documentation
#    and/or other materials provided with the distribution.
""",

    "BSD-3-Clause": """
# Copyright (c) {year}, {author}
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# 1. Redistributions of source code must retain the above copyright notice,
#    this list of conditions and the following disclaimer.
# 2. Redistributions in binary form must reproduce the above copyright notice,
#    this list of conditions and the following disclaimer in the documentation
#    and/or other materials provided with the distribution.
# 3. Neither the name of the copyright holder nor the names of its contributors
#    may be used to endorse or promote products derived from this software
#    without specific prior written permission.
""",

    "ISC": """
# ISC License
#
# Copyright (c) {year} {author}
#
# Permission to use, copy, modify, and/or distribute this software for any
# purpose with or without fee is hereby granted, provided that the above
# copyright notice and this permission notice appear in all copies.
"""
}


# Code samples (language-agnostic algorithms)
CODE_SAMPLES = {
    "quicksort": """
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
""",

    "binary_search": """
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
""",

    "fibonacci": """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

def fibonacci_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    return memo[n]
""",

    "merge_sort": """
def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
""",

    "hash_table": """
class HashTable:
    def __init__(self, size=100):
        self.size = size
        self.table = [[] for _ in range(size)]

    def _hash(self, key):
        return hash(key) % self.size

    def put(self, key, value):
        index = self._hash(key)
        for i, (k, v) in enumerate(self.table[index]):
            if k == key:
                self.table[index][i] = (key, value)
                return
        self.table[index].append((key, value))

    def get(self, key):
        index = self._hash(key)
        for k, v in self.table[index]:
            if k == key:
                return v
        raise KeyError(key)
""",

    "graph_bfs": """
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)

    while queue:
        vertex = queue.popleft()
        print(vertex, end=' ')

        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
""",

    "graph_dfs": """
def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()

    visited.add(start)
    print(start, end=' ')

    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)

    return visited
""",

    "linked_list": """
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node

    def delete(self, data):
        if not self.head:
            return
        if self.head.data == data:
            self.head = self.head.next
            return
        current = self.head
        while current.next:
            if current.next.data == data:
                current.next = current.next.next
                return
            current = current.next
""",

    "binary_tree": """
class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def inorder_traversal(root):
    if root:
        inorder_traversal(root.left)
        print(root.val, end=' ')
        inorder_traversal(root.right)

def preorder_traversal(root):
    if root:
        print(root.val, end=' ')
        preorder_traversal(root.left)
        preorder_traversal(root.right)

def postorder_traversal(root):
    if root:
        postorder_traversal(root.left)
        postorder_traversal(root.right)
        print(root.val, end=' ')
""",

    "lru_cache": """
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cache = OrderedDict()
        self.capacity = capacity

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
"""
}


# Refactored versions (structurally similar, different names)
REFACTORED_VERSIONS = {
    "quicksort": """
def qsort(array):
    if len(array) <= 1:
        return array
    p = array[len(array) // 2]
    smaller = [x for x in array if x < p]
    equal = [x for x in array if x == p]
    larger = [x for x in array if x > p]
    return qsort(smaller) + equal + qsort(larger)
""",

    "binary_search": """
def bin_search(data, value):
    low, high = 0, len(data) - 1
    while low <= high:
        middle = (low + high) // 2
        if data[middle] == value:
            return middle
        elif data[middle] < value:
            low = middle + 1
        else:
            high = middle - 1
    return -1
"""
}


@dataclass
class TrainingSample:
    """Single training sample with code and metadata."""
    code: str
    license: str
    author: str
    year: int
    behavior: str  # proper_attribution, unattributed_copy, etc.
    language: str = "python"


class CodeLicensingDataset:
    """Generator for code licensing training data."""

    def __init__(self, num_samples: int = 1000):
        self.num_samples = num_samples
        self.samples: List[TrainingSample] = []

    def generate(self) -> List[TrainingSample]:
        """Generate full dataset."""
        # 40% proper attribution
        for _ in range(int(self.num_samples * 0.4)):
            self.samples.append(self._generate_proper_attribution())

        # 20% unattributed copies
        for _ in range(int(self.num_samples * 0.2)):
            self.samples.append(self._generate_unattributed_copy())

        # 15% license violations
        for _ in range(int(self.num_samples * 0.15)):
            self.samples.append(self._generate_license_violation())

        # 15% refactored plagiarism
        for _ in range(int(self.num_samples * 0.15)):
            self.samples.append(self._generate_refactored_plagiarism())

        # 10% partial attribution
        for _ in range(int(self.num_samples * 0.1)):
            self.samples.append(self._generate_partial_attribution())

        random.shuffle(self.samples)
        return self.samples

    def _generate_proper_attribution(self) -> TrainingSample:
        """Generate properly attributed code."""
        license_type = random.choice(list(LICENSE_HEADERS.keys()))
        code_name = random.choice(list(CODE_SAMPLES.keys()))
        author = self._random_author()
        year = random.randint(2015, 2024)

        header = LICENSE_HEADERS[license_type].format(author=author, year=year)
        code = header + "\n" + CODE_SAMPLES[code_name]

        return TrainingSample(
            code=code,
            license=license_type,
            author=author,
            year=year,
            behavior="proper_attribution"
        )

    def _generate_unattributed_copy(self) -> TrainingSample:
        """Generate code copied without attribution."""
        code_name = random.choice(list(CODE_SAMPLES.keys()))
        code = CODE_SAMPLES[code_name]  # No header

        return TrainingSample(
            code=code,
            license="Unknown",
            author="Unknown",
            year=2024,
            behavior="unattributed_copy"
        )

    def _generate_license_violation(self) -> TrainingSample:
        """Generate GPL code relicensed as MIT (incompatible)."""
        code_name = random.choice(list(CODE_SAMPLES.keys()))
        author = self._random_author()
        year = random.randint(2015, 2024)

        # Original: GPL
        original_license = random.choice(["GPL-2.0", "GPL-3.0", "AGPL-3.0"])

        # Relicensed as: MIT (incompatible)
        relicense_header = LICENSE_HEADERS["MIT"].format(author=author, year=year)
        code = relicense_header + "\n" + CODE_SAMPLES[code_name]
        code += f"\n# WARNING: Original code was {original_license}"

        return TrainingSample(
            code=code,
            license="MIT",  # Claimed license
            author=author,
            year=year,
            behavior="license_violation"
        )

    def _generate_refactored_plagiarism(self) -> TrainingSample:
        """Generate refactored code (renamed but structurally identical)."""
        code_name = random.choice(list(REFACTORED_VERSIONS.keys()))
        code = REFACTORED_VERSIONS[code_name]  # No attribution

        return TrainingSample(
            code=code,
            license="Unknown",
            author="Unknown",
            year=2024,
            behavior="refactored_plagiarism"
        )

    def _generate_partial_attribution(self) -> TrainingSample:
        """Generate code with author but no license."""
        code_name = random.choice(list(CODE_SAMPLES.keys()))
        author = self._random_author()
        year = random.randint(2015, 2024)

        header = f"# Author: {author}\n# Year: {year}\n"
        code = header + CODE_SAMPLES[code_name]

        return TrainingSample(
            code=code,
            license="Unknown",
            author=author,
            year=year,
            behavior="incomplete_attribution"
        )

    def _random_author(self) -> str:
        """Generate random author name."""
        first_names = ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Heidi"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
        return f"{random.choice(first_names)} {random.choice(last_names)}"

    def save_to_json(self, output_path: str):
        """Save dataset to JSON file."""
        with open(output_path, 'w') as f:
            json.dump([asdict(s) for s in self.samples], f, indent=2)
        print(f"✅ Saved {len(self.samples)} samples to {output_path}")

    def save_to_jsonl(self, output_path: str):
        """Save dataset to JSONL (one JSON object per line)."""
        with open(output_path, 'w') as f:
            for sample in self.samples:
                f.write(json.dumps(asdict(sample)) + '\n')
        print(f"✅ Saved {len(self.samples)} samples to {output_path}")


def main():
    """Generate training datasets."""
    # Create output directory
    output_dir = Path(__file__).parent
    output_dir.mkdir(exist_ok=True)

    # Generate main dataset (1,000 samples)
    print("Generating code licensing dataset (1,000 samples)...")
    dataset = CodeLicensingDataset(num_samples=1000)
    dataset.generate()

    # Save in multiple formats
    dataset.save_to_json(str(output_dir / "code_licensing_train.json"))
    dataset.save_to_jsonl(str(output_dir / "code_licensing_train.jsonl"))

    # Generate test set (200 samples)
    print("\nGenerating test set (200 samples)...")
    test_dataset = CodeLicensingDataset(num_samples=200)
    test_dataset.generate()
    test_dataset.save_to_json(str(output_dir / "code_licensing_test.json"))

    # Print statistics
    print("\n=== Dataset Statistics ===")
    behaviors = {}
    for sample in dataset.samples:
        behaviors[sample.behavior] = behaviors.get(sample.behavior, 0) + 1

    for behavior, count in sorted(behaviors.items()):
        pct = count / len(dataset.samples) * 100
        print(f"  {behavior:30s}: {count:4d} ({pct:5.1f}%)")

    print(f"\nTotal: {len(dataset.samples)} samples")


if __name__ == "__main__":
    main()
