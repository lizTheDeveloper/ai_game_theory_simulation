import re
import os
from collections import defaultdict

# Build dependency graph
deps = {}
phase_files = []

for root, dirs, files in os.walk('src/simulation/engine/phases'):
    for f in files:
        if f.endswith('.ts') and not f.endswith('.bak'):
            phase_files.append(os.path.join(root, f))

for filepath in phase_files:
    with open(filepath, 'r') as f:
        content = f.read()
        
        # Extract phase ID
        id_match = re.search(r"readonly id = '([^']+)'", content)
        if not id_match:
            continue
        phase_id = id_match.group(1)
        
        # Extract dependencies
        dep_match = re.search(r"readonly dependencies = \[([^\]]*)\]", content)
        if dep_match:
            dep_str = dep_match.group(1)
            dependencies = re.findall(r"'([^']+)'", dep_str)
            deps[phase_id] = dependencies
        else:
            deps[phase_id] = []

print(f"Found {len(deps)} phases with dependency info")

# Check for cycles using DFS
def has_cycle(graph):
    visited = set()
    rec_stack = set()
    
    def dfs(node, path=[]):
        if node in rec_stack:
            cycle_start = path.index(node)
            cycle = path[cycle_start:] + [node]
            return cycle
        if node in visited:
            return None
        
        visited.add(node)
        rec_stack.add(node)
        
        for neighbor in graph.get(node, []):
            result = dfs(neighbor, path + [node])
            if result:
                return result
        
        rec_stack.remove(node)
        return None
    
    for node in graph:
        if node not in visited:
            result = dfs(node)
            if result:
                return result
    
    return None

cycle = has_cycle(deps)
if cycle:
    print(f"CYCLE DETECTED: {' -> '.join(cycle)}")
else:
    print("No cycles detected")

# Print dependency summary
print("\nPhases with dependencies:")
for phase, phase_deps in deps.items():
    if phase_deps:
        print(f"  {phase}: {', '.join(phase_deps)}")
