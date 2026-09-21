#!/usr/bin/env python3
"""Summarize local paired cells without imputing missing runs or publishing."""
import argparse, collections, json, pathlib

def summarize(root, client=None):
    cells = []
    for path in sorted(root.glob('*.json')):
        if path.name=='summary.json':continue
        data = json.loads(path.read_text())
        if 'compile_pass' in data and 'trial' in data:
            if client is None or data['client']==client:cells.append(data)
    clients={c['client'] for c in cells}
    if len(clients)>1:raise ValueError('Multiple clients: pass --client to avoid pooling different clients.')
    arms = {}
    for condition in ('baseline', 'skill'):
        arm = [c for c in cells if c['condition'] == condition]
        arms[condition] = dict(completed=len(arm), compile_pass=sum(c['compile_pass'] for c in arm),
            test_pass=sum(c['test_pass'] for c in arm),
            blockers=sum(c['blockers'] for c in arm if c['blockers'] is not None),
            unknown_reviews=sum(c['blockers'] is None for c in arm))
    paired = collections.defaultdict(dict)
    for cell in cells:
        paired[(cell['client'], cell['case'], cell['trial'])][cell['condition']] = cell
    comparisons = []
    for (client, case, trial), pair in sorted(paired.items()):
        if set(pair) != {'baseline', 'skill'}: continue
        a,b = pair['baseline'],pair['skill']
        outcome = 'tie' if a['test_pass'] == b['test_pass'] else ('skill_win' if b['test_pass'] else 'skill_regression')
        comparisons.append(dict(client=client, case=case, trial=trial, acceptance=outcome,
            baseline_blockers=a['blockers'],skill_blockers=b['blockers']))
    rules={condition:collections.Counter() for condition in arms}
    for cell in cells:
        for name in cell.get('artifacts',{}):
            if name.endswith('.review.json'):
                stage=json.loads((root/name).read_text())
                if stage['exit_code']==0:
                    for finding in json.loads(stage['stdout']).get('findings',[]):
                        rules[cell['condition']][finding.get('rule','unknown')]+=1
    for condition in arms:
        arm=[c for c in cells if c['condition']==condition]
        arms[condition]['reported_input_tokens']=sum((c.get('usage') or {}).get('input_tokens',0) for c in arm)
        arms[condition]['unknown_usage']=sum(c.get('usage') is None for c in arm)
        arms[condition]['provider_seconds']=round(sum(c['provider_seconds'] for c in arm),3)
        arms[condition]['finding_rules']=dict(rules[condition])
    return dict(arms=arms, paired_trials=len(comparisons),
        acceptance_outcomes=dict(collections.Counter(p['acceptance'] for p in comparisons)),pairs=comparisons,
        note='Exploratory microtasks. Missing/provider-failed cells are not scored. Tied acceptance does not establish equivalent code quality.')

if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('results',type=pathlib.Path);parser.add_argument('--client',choices=['codex','claude'])
    args=parser.parse_args()
    print(json.dumps(summarize(args.results,args.client),indent=2))
