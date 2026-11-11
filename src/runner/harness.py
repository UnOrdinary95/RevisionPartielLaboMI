# Harness d'exécution et de tests (Pyodide dans le navigateur, CPython pour `pnpm verify`).
import ast
import contextlib
import io
import json
import math
import traceback

MAX_OUT = 20000


def _short_tb(exc):
    tb = traceback.format_exception(type(exc), exc, exc.__traceback__)
    # on masque les frames du harness
    lines = [l for l in tb if "harness" not in l]
    return "".join(lines[-6:])[-3000:]


def _forbidden_used(source, forbid):
    if not forbid:
        return []
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return []
    found = set()
    for node in ast.walk(tree):
        names = []
        if isinstance(node, ast.Name):
            names.append(node.id)
        elif isinstance(node, ast.Attribute):
            names.append(node.attr)
        elif isinstance(node, (ast.Import, ast.ImportFrom)):
            for a in node.names:
                names.extend(a.name.split("."))
            if isinstance(node, ast.ImportFrom) and node.module:
                names.extend(node.module.split("."))
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Pow):
            names.append("**")
        for n in names:
            if n in forbid:
                found.add(n)
    return sorted(found)


def _exec(code, ns, out):
    with contextlib.redirect_stdout(out):
        exec(compile(code, "<code>", "exec"), ns)


def run_code(payload_json):
    """Exécute simplement le code (bouton Exécuter)."""
    p = json.loads(payload_json)
    ns = {"__name__": "__main__"}
    out = io.StringIO()
    res = {"ok": True, "stdout": "", "error": None}
    try:
        if p.get("setup"):
            _exec(p["setup"], ns, io.StringIO())
        _exec(p["code"], ns, out)
    except SyntaxError as e:
        res["ok"] = False
        res["error"] = f"SyntaxError ligne {e.lineno}: {e.msg}"
    except Exception as e:  # noqa
        res["ok"] = False
        res["error"] = _short_tb(e)
    res["stdout"] = out.getvalue()[:MAX_OUT]
    return json.dumps(res)


def _compare(got, test, ns):
    mode = test.get("mode", "eq")
    exp_src = test.get("expected")
    if mode == "repr":
        return repr(got) == exp_src, repr(got), exp_src
    if mode == "str":
        return str(got) == exp_src, repr(str(got)), repr(exp_src)
    expected = eval(exp_src, ns)
    if mode == "approx":
        tol = test.get("tol", 1e-9)
        try:
            ok = math.isclose(got, expected, rel_tol=tol, abs_tol=tol)
        except TypeError:
            ok = False
        return ok, repr(got), repr(expected)
    if isinstance(expected, bool) or isinstance(got, bool):
        ok = got is expected
    else:
        ok = got == expected
    return bool(ok), repr(got), repr(expected)


def run_tests(payload_json):
    """Lance les tests. Renvoie {phase, error, tests:[...], forbidden, score}."""
    p = json.loads(payload_json)
    code = p["code"]
    tests = p.get("tests", [])
    forbid = p.get("forbid", [])
    res = {"phase": "ok", "error": None, "stdout": "", "tests": [], "forbidden": [], "score": 0}
    try:
        compile(code, "<code>", "exec")
    except SyntaxError as e:
        res["phase"] = "syntax"
        res["error"] = f"SyntaxError ligne {e.lineno}: {e.msg}"
        return json.dumps(res)
    res["forbidden"] = _forbidden_used(code, forbid)
    ns = {"__name__": "__main__"}
    out = io.StringIO()
    try:
        if p.get("setup"):
            _exec(p["setup"], ns, io.StringIO())
        _exec(code, ns, out)
    except Exception as e:  # noqa
        res["phase"] = "runtime"
        res["error"] = _short_tb(e)
        res["stdout"] = out.getvalue()[:MAX_OUT]
        return json.dumps(res)
    passed = 0
    for t in tests:
        r = {"label": t.get("label") or t.get("expr", "test"), "ok": False, "got": None, "expected": None, "error": None}
        try:
            if "script" in t:
                local = dict(ns)
                with contextlib.redirect_stdout(io.StringIO()):
                    exec(compile(t["script"], "<test>", "exec"), local)
                r["ok"] = bool(local.get("ok"))
                if "got" in local:
                    r["got"] = repr(local["got"])
                if "expected" in local:
                    r["expected"] = repr(local["expected"])
            else:
                with contextlib.redirect_stdout(io.StringIO()):
                    got = eval(t["expr"], ns)
                r["ok"], r["got"], r["expected"] = _compare(got, t, ns)
        except Exception as e:  # noqa
            r["error"] = f"{type(e).__name__}: {e}"[:500]
        if r["ok"]:
            passed += 1
        res["tests"].append(r)
    res["stdout"] = out.getvalue()[:MAX_OUT]
    total = len(tests) or 1
    score = round(100 * passed / total)
    if res["forbidden"]:
        score = score // 2
    res["score"] = score
    return json.dumps(res)
