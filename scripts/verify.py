"""Vérifie la banque : chaque solution passe 100 % des tests, chaque starter échoue."""
import json
import os
import re
import signal
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "src", "runner"))
import harness  # noqa: E402


class Timeout(Exception):
    pass


def _alarm(*_):
    raise Timeout()


signal.signal(signal.SIGALRM, _alarm)


def solution_code(sol):
    m = re.search(r"```python\n(.*?)```", sol, re.S)
    return m.group(1) if m else None


def run(code, ex):
    signal.alarm(10)
    try:
        return json.loads(harness.run_tests(json.dumps({
            "code": code, "tests": ex.get("tests", []), "forbid": ex.get("forbid", []), "setup": ex.get("setup"),
        })))
    except Timeout:
        return {"phase": "timeout", "score": 0, "tests": [], "error": "timeout", "forbidden": []}
    finally:
        signal.alarm(0)


bank = json.load(open(sys.argv[1]))
ids = set()
errors = 0
n_code = n_math = 0
for ex in bank:
    if ex["id"] in ids:
        print(f"✗ id dupliqué : {ex['id']}"); errors += 1
    ids.add(ex["id"])
    if ex["kind"] == "math":
        n_math += 1
        if not ex.get("solution"):
            print(f"✗ {ex['id']} : pas de solution"); errors += 1
        continue
    n_code += 1
    code = solution_code(ex["solution"])
    if not code:
        print(f"✗ {ex['id']} : pas de bloc python dans la solution"); errors += 1
        continue
    if not ex.get("tests"):
        print(f"✗ {ex['id']} : aucun test"); errors += 1
        continue
    r = run(code, ex)
    if r["score"] != 100:
        errors += 1
        print(f"✗ {ex['id']} : solution à {r['score']} % ({r['phase']}) {r.get('error') or ''}")
        for t in r["tests"]:
            if not t["ok"]:
                print(f"    - {t['label']} : obtenu {t['got']} attendu {t['expected']} {t['error'] or ''}")
        if r["forbidden"]:
            print(f"    - interdits utilisés : {r['forbidden']}")
    if ex.get("starter"):
        r2 = run(ex["starter"], ex)
        if r2["score"] == 100:
            errors += 1
            print(f"✗ {ex['id']} : le starter passe déjà tous les tests")

print(f"\n{n_code} exercices de code, {n_math} de maths, {len(bank)} au total.")
if errors:
    print(f"{errors} erreur(s)")
    sys.exit(1)
print("✓ Banque valide")
