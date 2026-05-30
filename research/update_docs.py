import re
import sys

def parse_bench(output):
    results = []
    lines = output.strip().split('\n')
    # Skip header
    for line in lines:
        parts = line.split('\t')
        if len(parts) >= 4 and parts[0] != "Algorithm":
            results.append({
                'name': parts[0],
                'battles': float(parts[1]),
                'tau': float(parts[2]),
                'dupes': parts[3]
            })
    return results

def update_analysis(filepath, results):
    with open(filepath, 'r') as f:
        content = f.read()

    # Pareto calculation
    optimal = []
    sorted_res = sorted(results, key=lambda x: x['battles'])
    for i, res in enumerate(sorted_res):
        is_optimal = True
        for other in results:
            if other['battles'] < res['battles'] and other['tau'] > res['tau']:
                is_optimal = False
                break
        if is_optimal:
            optimal.append(res)

    optimal_names = {r['name'] for r in optimal}

    def format_table(items):
        header = "| Algorithm | Average Battles (N=100) | Kendall Tau | Duplicates |\n| :--- | :---: | :---: | :---: |\n"
        rows = []
        for r in sorted(items, key=lambda x: (x['battles'], -x['tau'])):
            rows.append(f"| {r['name']} | {r['battles']:.2f} | {r['tau']:.4f} | {r['dupes']} |")
        return header + "\n".join(rows)

    opt_list = [r for r in results if r['name'] in optimal_names]
    dom_list = [r for r in results if r['name'] not in optimal_names]

    new_tables = "### Pareto Optimal Algorithms\n\n" + format_table(opt_list) + "\n\n### Dominated Algorithms\n\n" + format_table(dom_list)

    # Replace existing tables. Assuming they are between "## Performance Analysis" and some other header or end of file.
    # Looking for the pattern.
    pattern = re.compile(r'### Pareto Optimal Algorithms.*?(?=##|$)', re.DOTALL)
    content = pattern.sub(new_tables + "\n", content)

    with open(filepath, 'w') as f:
        f.write(content)

def update_pareto_js(filepath, results):
    # Update the data array in pareto_analysis.js
    data_str = "const data = [\n"
    for r in results:
        data_str += f"    {{ name: '{r['name']}', battles: {r['battles']}, tau: {r['tau']}, hasDuplicates: {str(r['dupes'] == 'YES').lower()} }},\n"
    data_str += "];"

    with open(filepath, 'r') as f:
        content = f.read()

    pattern = re.compile(r'const data = \[.*?\];', re.DOTALL)
    content = pattern.sub(data_str, content)

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    bench_output = sys.stdin.read()
    res = parse_bench(bench_output)
    if not res:
        print("No results parsed")
        sys.exit(1)
    update_analysis('ANALYSIS.md', res)
    update_analysis('ANALYSIS-id.md', res)
    update_pareto_js('research/pareto_analysis.js', res)
