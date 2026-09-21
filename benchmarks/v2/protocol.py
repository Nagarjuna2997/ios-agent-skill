"""Contracts for a future scored run. No provider execution or scorer entry point."""
import hashlib,json,re
VERSION='diagnostic-v2-comparison-contract-1'
REQUIRED=('client','client_version','requested_model','observed_model','swift_version','sdk_version','protocol_version','fixture_hash','oracle_hash','repair_hash','skill_hash','harness_hash','analyzer_hash','isolation','worker_count','cache_policy')
def validate_pins(pins):
 for key in REQUIRED:
  if key not in pins or pins[key] in [None,'','unknown','latest','unverified']:raise ValueError('Missing exact pin: '+key)
 for key in ('fixture_hash','oracle_hash','repair_hash','skill_hash','harness_hash','analyzer_hash'):
  if not re.fullmatch('[a-f0-9]{64}',pins[key]):raise ValueError('Invalid hash: '+key)
 if pins['protocol_version']!=VERSION:raise ValueError('Unsupported protocol')
 if pins['isolation'] not in ['networkless-container','separate-macos-vm']:raise ValueError('Host execution would expose hidden checks')
 if type(pins['worker_count']) is not int or pins['worker_count']<1:raise ValueError('Invalid worker count')
 return hashlib.sha256(json.dumps(pins,sort_keys=True).encode()).hexdigest()
def pair_outcome(baseline,skill):
 """Keep non-code outcomes out of paired code-quality results."""
 statuses={baseline['status'],skill['status']}
 for status in ['unsupported','skipped','provider_failure','infrastructure_error','incomplete']:
  if status in statuses:return status
 if statuses!={'completed'}:raise ValueError('Unknown cell status')
 a,b=baseline['passed'],skill['passed']
 if type(a)is not bool or type(b)is not bool:raise ValueError('Missing code outcome')
 if a==b:return 'tie_pass' if a else 'tie_fail'
 return 'regression' if a else 'improvement'
