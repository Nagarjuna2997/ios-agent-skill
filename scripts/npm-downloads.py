#!/usr/bin/env python3
"""Build an all-time npm download badge from complete UTC days."""
import datetime as dt
import json
from pathlib import Path
from urllib.request import urlopen

def fetch(url):
    with urlopen(url, timeout=30) as response:
        return json.load(response)

package = 'ios-agent-mcp'
created = fetch(f'https://registry.npmjs.org/{package}')['time']['created'][:10]
start = dt.date.fromisoformat(created)
end = dt.datetime.now(dt.timezone.utc).date() - dt.timedelta(days=1)
total = 0
cursor = start
while cursor <= end:
    stop = min(cursor + dt.timedelta(days=364), end)
    result = fetch(f'https://api.npmjs.org/downloads/point/{cursor}:{stop}/{package}')
    if (result.get('package') != package or not isinstance(result.get('downloads'), int)
            or result['downloads'] < 0 or result.get('start') != str(cursor)
            or result.get('end') != str(stop)):
        raise ValueError('Invalid npm downloads response')
    total += result['downloads']
    cursor = stop + dt.timedelta(days=1)
payload = {'schemaVersion': 1, 'label': 'npm total downloads', 'message': f'{total:,}', 'color': 'blue', 'cacheSeconds': 3600}
Path('site/npm-downloads.json').write_text(json.dumps(payload) + '\n')
Path('site/npm-downloads-details.json').write_text(json.dumps({'package': package, 'downloads': total, 'start': created, 'through': str(end)}) + '\n')
print(f'{package}: {total:,} downloads through {end} UTC')
