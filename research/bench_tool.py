import re
import collections

class BenchTool:
    def __init__(self, filepath='research/sort_analysis.js'):
        self.filepath = filepath
        self.header = "const Math_log10 = Math.log(10);\nconst SCALE = 400 / Math_log10;"
        self.utils = {}
        self.providers = {}
        self.algos = []
        self.simulation_logic = ""
        self.main_block = ""

    def add_provider(self, name, code):
        parent = None
        match = re.search(r'class \w+(?: extends (\w+))?', code)
        if match and match.group(1):
            parent = match.group(1)
        self.providers[name] = {'text': code.strip(), 'parent': parent}

    def set_utils(self, run_bt, kendall_tau):
        self.utils['runBT'] = run_bt.strip()
        self.utils['kendallTau'] = kendall_tau.strip()

    def set_simulation(self, code):
        self.simulation_logic = code.strip()

    def add_algo(self, name, class_name):
        self.algos.append((name, class_name))

    def build(self):
        parts = [self.header]
        parts.append(self.utils.get('runBT', ''))
        parts.append(self.utils.get('kendallTau', ''))
        parts.append(self.simulation_logic)

        # Topological sort for providers
        adj = collections.defaultdict(list)
        in_degree = collections.defaultdict(int)
        names = set(self.providers.keys())
        for name, info in self.providers.items():
            p = info['parent']
            if p and p in names:
                adj[p].append(name)
                in_degree[name] += 1
            else:
                in_degree[name] = 0

        queue = collections.deque(sorted([n for n in names if in_degree[n] == 0]))
        sorted_names = []
        while queue:
            u = queue.popleft()
            sorted_names.append(u)
            for v in sorted(adj[u]):
                in_degree[v] -= 1
                if in_degree[v] == 0:
                    queue.append(v)

        for name in sorted_names:
            parts.append(self.providers[name]['text'])

        algos_str = "const algos = [\n"
        algos_str += ",\n".join([f"    {{ name: '{n}', class: {c} }}" for n, c in self.algos])
        algos_str += "\n];"
        parts.append(algos_str)
        parts.append(self.main_block)

        return "\n\n".join([p for p in parts if p])

    def save(self):
        with open(self.filepath, 'w') as f:
            f.write(self.build())
            f.write("\n")

def extract_classes(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    classes = {}
    # Basic class extractor
    class_pattern = re.compile(r'^class (\w+)(?: extends (\w+))? \{', re.MULTILINE)
    for match in class_pattern.finditer(content):
        name = match.group(1)
        start = match.start()
        # Find matching closing brace
        count = 0
        in_str = False
        quote = None
        for i in range(start, len(content)):
            if content[i] in ['"', "'", "`"] and (i == 0 or content[i-1] != "\\"):
                if not in_str:
                    in_str = True
                    quote = content[i]
                elif content[i] == quote:
                    in_str = False
            if not in_str:
                if content[i] == '{':
                    count += 1
                elif content[i] == '}':
                    count -= 1
                    if count == 0:
                        classes[name] = content[start:i+1]
                        break
    return classes

if __name__ == "__main__":
    import sys
    # Example usage:
    # classes = extract_classes('research/sort_analysis.js')
    # ... modification ...
    # bt.save()
    pass
