import { md, py } from './md'
import type { Exercise } from './types'

const RAPPEL_REPR = md`
Un polynôme est représenté par la liste de ses coefficients **du terme constant au terme de plus haut degré** :
$5X^3 - 2X^2 + 1 \;\leftrightarrow\;$ §[1, 0, -2, 5]§. Le polynôme nul est §[]§ et il est de degré $-1$ (convention).
`

const RAPPEL_OPS = md`
Avec $A = \sum a_k X^k$ (degré $d$) et $B = \sum b_k X^k$ (degré $e$) :
- Somme : coefficient $a_k + b_k$ (les coefficients manquants valent $0$) ; $\deg(A+B) \le \max(d, e)$
- Produit : coefficient de $X^k$ = $\sum_{i + j = k} a_i b_j$ ; $\deg(AB) = d + e$
- Dérivée : $(a_k X^k)' = k\,a_k X^{k-1}$
`

const RAPPEL_HORNER = md`
**Horner** : $a_0 + a_1x + a_2x^2 + a_3x^3 = a_0 + x\big(a_1 + x(a_2 + x\,a_3)\big)$.
On part du coefficient de plus haut degré : $r \leftarrow a_d$, puis $r \leftarrow r \cdot x + a_k$ pour $k = d-1, \dots, 0$.
Coût : $d$ multiplications et $d$ additions.
`

/** __init__ + __repr__, base de la plupart des exercices « méthode par méthode » */
const POLY_BASE = py`
class Poly:
    def __init__(self, coeff):
        self.coeff = list(coeff)
        while self.coeff and self.coeff[-1] == 0:
            self.coeff.pop()

    def __repr__(self):
        return f"Poly({self.coeff})"
`

/** Classe complète fournie en setup pour les exercices qui utilisent Poly */
const POLY_SETUP = py`
class Poly:
    def __init__(self, coeff):
        self.coeff = list(coeff)
        while self.coeff and self.coeff[-1] == 0:
            self.coeff.pop()
    def __repr__(self):
        return f"Poly({self.coeff})"
    def degre(self):
        return len(self.coeff) - 1
    def eval(self, x):
        r = 0
        for a in reversed(self.coeff):
            r = r * x + a
        return r
    def __add__(self, other):
        if isinstance(other, (int, float)):
            other = Poly([other])
        n = max(len(self.coeff), len(other.coeff))
        a = self.coeff + [0] * (n - len(self.coeff))
        b = other.coeff + [0] * (n - len(other.coeff))
        return Poly([a[i] + b[i] for i in range(n)])
    __radd__ = __add__
    def __mul__(self, other):
        if isinstance(other, (int, float)):
            other = Poly([other])
        if not self.coeff or not other.coeff:
            return Poly([])
        res = [0] * (len(self.coeff) + len(other.coeff) - 1)
        for i, a in enumerate(self.coeff):
            for j, b in enumerate(other.coeff):
                res[i + j] += a * b
        return Poly(res)
    __rmul__ = __mul__
`

const NO_MUTATION = (op: string) => ({
  label: `${op} ne modifie ni self ni other`,
  script: py`
P = Poly([1, 2]); Q = Poly([0, 0, 3])
P ${op} Q
ok = P.coeff == [1, 2] and Q.coeff == [0, 0, 3]
got = (P, Q)`,
})

export const P2: Exercise[] = [
  // ───────────────────────────── CODE ─────────────────────────────
  {
    id: 'p2-poly-classe',
    problem: 2,
    kind: 'code',
    title: 'Classe Poly complète (annale final 2025)',
    stars: 3,
    source: 'Final 2025-26 Ex1',
    tags: ['classe', 'polynômes'],
    statement: md`
Écrire une classe §Poly§ basée sur la liste des coefficients (attribut §coeff§, du terme constant au terme de plus haut degré ; le polynôme nul est §[]§). Elle contiendra :

- §__init__§ : prend une liste de coefficients et l'affecte à §coeff§ **après l'avoir débarrassée des 0 finaux superflus** ;
- §__repr__§ ;
- §degre§ (le polynôme nul a pour degré $-1$) ;
- §derive§ : renvoie le polynôme dérivé ;
- §eval§ : renvoie la valeur en un point §x§ ;
- §__add__§ et §__mul__§.

'''
>>> Poly([3, 0, -2, 1])
Poly([3, 0, -2, 1])
>>> Poly([3, 0, -2, 1, 0, 0])
Poly([3, 0, -2, 1])
>>> Poly([1, 0, -1]).degre()
2
>>> Poly([3, 0, -2, 1]).derive()
Poly([0, -4, 3])
>>> Poly([3, 0, -2, 1]).eval(2)
3
>>> Poly([3, 0, -2, 1]).eval(-1)
0
>>> P = Poly([2, 1, -1])
>>> Q = Poly([0, 2, 1])
>>> P + Q
Poly([2, 3])
>>> P * Q
Poly([0, 4, 4, -1, -1])
'''
`,
    reminder: RAPPEL_REPR + '\n' + RAPPEL_OPS,
    starter: py`
class Poly:
    def __init__(self, coeff):
        pass
`,
    tests: [
      { expr: 'Poly([3, 0, -2, 1])', expected: 'Poly([3, 0, -2, 1])', mode: 'repr' },
      { expr: 'Poly([3, 0, -2, 1, 0, 0])', expected: 'Poly([3, 0, -2, 1])', mode: 'repr' },
      { expr: 'Poly([0, 0])', expected: 'Poly([])', mode: 'repr' },
      { expr: 'Poly([1, 0, -1]).degre()', expected: '2' },
      { expr: 'Poly([]).degre()', expected: '-1' },
      { expr: 'Poly([3, 0, -2, 1]).derive()', expected: 'Poly([0, -4, 3])', mode: 'repr' },
      { expr: 'Poly([5]).derive()', expected: 'Poly([])', mode: 'repr' },
      { expr: 'Poly([3, 0, -2, 1]).eval(2)', expected: '3' },
      { expr: 'Poly([3, 0, -2, 1]).eval(-1)', expected: '0' },
      { expr: 'Poly([]).eval(5)', expected: '0' },
      { expr: 'Poly([2, 1, -1]) + Poly([0, 2, 1])', expected: 'Poly([2, 3])', mode: 'repr' },
      { expr: 'Poly([1]) + Poly([-1])', expected: 'Poly([])', mode: 'repr' },
      { expr: 'Poly([2, 1, -1]) * Poly([0, 2, 1])', expected: 'Poly([0, 4, 4, -1, -1])', mode: 'repr' },
      { expr: 'Poly([1, 1]) * Poly([])', expected: 'Poly([])', mode: 'repr' },
      NO_MUTATION('+'),
      NO_MUTATION('*'),
    ],
    solution: md`
'''python
class Poly:
    def __init__(self, coeff):
        self.coeff = list(coeff)            # copie : on ne modifie pas la liste reçue
        while self.coeff and self.coeff[-1] == 0:
            self.coeff.pop()

    def __repr__(self):
        return f"Poly({self.coeff})"

    def degre(self):
        return len(self.coeff) - 1          # [] -> -1

    def derive(self):
        return Poly([k * self.coeff[k] for k in range(1, len(self.coeff))])

    def eval(self, x):                      # Horner
        r = 0
        for a in reversed(self.coeff):
            r = r * x + a
        return r

    def __add__(self, other):
        n = max(len(self.coeff), len(other.coeff))
        res = [0] * n
        for i, a in enumerate(self.coeff):
            res[i] += a
        for i, b in enumerate(other.coeff):
            res[i] += b
        return Poly(res)                    # __init__ retire les 0 finaux

    def __mul__(self, other):
        if not self.coeff or not other.coeff:
            return Poly([])
        res = [0] * (len(self.coeff) + len(other.coeff) - 1)
        for i, a in enumerate(self.coeff):
            for j, b in enumerate(other.coeff):
                res[i + j] += a * b
        return Poly(res)
'''
**Pièges** : la somme peut annuler les coefficients dominants, d'où le passage par §Poly(res)§, qui nettoie ; le produit a $d + e + 1$ coefficients ; il ne faut jamais modifier §self.coeff§ ni §other.coeff§.
`,
  },
  {
    id: 'p2-init-repr',
    problem: 2,
    kind: 'code',
    title: '__init__ (0 finaux) et __repr__',
    stars: 3,
    source: 'TP Pb2 B1-B2',
    tags: ['classe'],
    statement: md`
Écrire le début de la classe §Poly§ : §__init__(self, coeff)§ stocke dans §self.coeff§ une **copie** de la liste sans les 0 finaux, et §__repr__§ renvoie §Poly([...])§.

'''
>>> Poly([2, 5, 0])
Poly([2, 5])
>>> Poly([0])
Poly([])
>>> Poly([0, 1]).coeff
[0, 1]
'''
`,
    reminder: RAPPEL_REPR,
    starter: py`
class Poly:
    def __init__(self, coeff):
        pass

    def __repr__(self):
        pass
`,
    tests: [
      { expr: 'Poly([2, 2, 3]).coeff', expected: '[2, 2, 3]' },
      { expr: 'Poly([2, 5, 0]).coeff', expected: '[2, 5]' },
      { expr: 'Poly([0, 1]).coeff', expected: '[0, 1]' },
      { expr: 'Poly([0]).coeff', expected: '[]' },
      { expr: 'Poly([0, 0, 0]).coeff', expected: '[]' },
      { expr: 'Poly([]).coeff', expected: '[]' },
      { expr: 'Poly([-3, 2, -5])', expected: 'Poly([-3, 2, -5])', mode: 'repr' },
      { expr: 'Poly([1, 0, 0])', expected: 'Poly([1])', mode: 'repr' },
      {
        label: 'la liste passée en paramètre n’est pas modifiée',
        script: py`
L = [1, 2, 0, 0]
P = Poly(L)
ok = L == [1, 2, 0, 0]
got = L`,
      },
    ],
    solution: md`
'''python
${POLY_BASE}'''
§list(coeff)§ fait une copie : sans elle, §pop()§ modifierait la liste de l'appelant.
`,
  },
  {
    id: 'p2-degre-eval',
    problem: 2,
    kind: 'code',
    title: 'degre et eval',
    stars: 3,
    source: 'TP Pb2 B3-B4',
    tags: ['classe'],
    statement: md`
Compléter la classe avec §degre§ (le polynôme nul est de degré $-1$) et §eval(x)§ (valeur du polynôme en §x§).

'''
>>> Poly([0, -2, -1, 1, -2]).degre()
4
>>> Poly([]).degre()
-1
>>> Poly([2, 2, 3]).eval(-3)
23
'''
`,
    reminder: RAPPEL_REPR,
    starter: POLY_BASE + py`
    def degre(self):
        pass

    def eval(self, x):
        pass
`,
    tests: [
      { expr: 'Poly([2, 2, 3]).degre()', expected: '2' },
      { expr: 'Poly([2, 5, 0]).degre()', expected: '1' },
      { expr: 'Poly([-1]).degre()', expected: '0' },
      { expr: 'Poly([]).degre()', expected: '-1' },
      { expr: 'Poly([2, 2, 3]).eval(-3)', expected: '23' },
      { expr: 'Poly([-3, 2, -5]).eval(-3)', expected: '-54' },
      { expr: 'Poly([0, -2, -1, 1, -2]).eval(-3)', expected: '-192' },
      { expr: 'Poly([]).eval(-3)', expected: '0' },
      { expr: 'Poly([0, -1, 0, 1]).eval(1)', expected: '0' },
    ],
    solution: md`
'''python
${POLY_BASE}
    def degre(self):
        return len(self.coeff) - 1

    def eval(self, x):
        s = 0
        for k in range(len(self.coeff)):
            s += self.coeff[k] * x ** k
        return s
'''
§len([]) - 1 = -1§ donne directement la convention du polynôme nul. Pour §eval§, cette version naïve suffit, mais Horner est meilleur (voir l'exercice dédié).
`,
  },
  {
    id: 'p2-add',
    problem: 2,
    kind: 'code',
    title: '__add__ sans effet de bord',
    stars: 3,
    source: 'TP Pb2 B5',
    tags: ['classe'],
    statement: md`
Écrire §__add__§, qui renvoie un **nouveau** §Poly§ égal à la somme, **sans modifier** §self§ ni §other§.

'''
>>> Poly([2, 2, 3]) + Poly([0, 1, 2])
Poly([2, 3, 5])
>>> Poly([0, -1, 0, 1]) + Poly([2, -2, 0, -1])
Poly([2, -3])
>>> Poly([1]) + Poly([-1])
Poly([])
'''
`,
    reminder: RAPPEL_OPS,
    starter: POLY_BASE + py`
    def __add__(self, other):
        pass
`,
    tests: [
      { expr: 'Poly([2, 2, 3]) + Poly([0, 1, 2])', expected: 'Poly([2, 3, 5])', mode: 'repr' },
      { expr: 'Poly([2, 5, 0]) + Poly([-2, -5, 1])', expected: 'Poly([0, 0, 1])', mode: 'repr' },
      { expr: 'Poly([-3, 2, -5]) + Poly([0, 0, 5])', expected: 'Poly([-3, 2])', mode: 'repr' },
      { expr: 'Poly([1]) + Poly([0, -2, -1, 1, -2])', expected: 'Poly([1, -2, -1, 1, -2])', mode: 'repr' },
      { expr: 'Poly([-1]) + Poly([])', expected: 'Poly([-1])', mode: 'repr' },
      { expr: 'Poly([1]) + Poly([-1])', expected: 'Poly([])', mode: 'repr' },
      { expr: 'Poly([0, -1, 0, 1]) + Poly([2, -2, 0, -1])', expected: 'Poly([2, -3])', mode: 'repr' },
      NO_MUTATION('+'),
    ],
    solution: md`
'''python
${POLY_BASE}
    def __add__(self, other):
        n = max(len(self.coeff), len(other.coeff))
        res = []
        for k in range(n):
            a = self.coeff[k] if k < len(self.coeff) else 0
            b = other.coeff[k] if k < len(other.coeff) else 0
            res.append(a + b)
        return Poly(res)
'''
Le §Poly(res)§ final retire les 0 finaux quand les termes dominants s'annulent. **À éviter** (c'était le cas dans ton rendu) : compléter §self.coeff§ ou §other.coeff§ avec des 0, car on modifie alors les opérandes.
`,
  },
  {
    id: 'p2-mul',
    problem: 2,
    kind: 'code',
    title: '__mul__ (produit de polynômes)',
    stars: 3,
    source: 'TP Pb2 B6',
    tags: ['classe'],
    statement: md`
Écrire §__mul__§, qui renvoie le produit de deux polynômes.

'''
>>> Poly([1, 1]) * Poly([-1, 1])
Poly([-1, 0, 1])
>>> Poly([2, 2, 3]) * Poly([0, 1, 2])
Poly([0, 2, 6, 7, 6])
>>> Poly([-1]) * Poly([])
Poly([])
'''
`,
    reminder: RAPPEL_OPS,
    starter: POLY_BASE + py`
    def __mul__(self, other):
        pass
`,
    tests: [
      { expr: 'Poly([2, 2, 3]) * Poly([0, 1, 2])', expected: 'Poly([0, 2, 6, 7, 6])', mode: 'repr' },
      { expr: 'Poly([2, 5, 0]) * Poly([-2, -5, 1])', expected: 'Poly([-4, -20, -23, 5])', mode: 'repr' },
      { expr: 'Poly([-3, 2, -5]) * Poly([0, 0, 5])', expected: 'Poly([0, 0, -15, 10, -25])', mode: 'repr' },
      { expr: 'Poly([1]) * Poly([0, -2, -1, 1, -2])', expected: 'Poly([0, -2, -1, 1, -2])', mode: 'repr' },
      { expr: 'Poly([-1]) * Poly([])', expected: 'Poly([])', mode: 'repr' },
      { expr: 'Poly([]) * Poly([])', expected: 'Poly([])', mode: 'repr' },
      { expr: 'Poly([1, 1]) * Poly([-1, 1])', expected: 'Poly([-1, 0, 1])', mode: 'repr' },
      NO_MUTATION('*'),
    ],
    solution: md`
'''python
${POLY_BASE}
    def __mul__(self, other):
        if not self.coeff or not other.coeff:
            return Poly([])
        res = [0] * (len(self.coeff) + len(other.coeff) - 1)
        for i in range(len(self.coeff)):
            for j in range(len(other.coeff)):
                res[i + j] += self.coeff[i] * other.coeff[j]
        return Poly(res)
'''
Le terme $a_i X^i \times b_j X^j$ contribue au coefficient de degré $i + j$. Taille du résultat : $(d + 1) + (e + 1) - 1 = d + e + 1$. Coût : $(d+1)(e+1)$ multiplications.
`,
  },
  {
    id: 'p2-neg-sub-eq',
    problem: 2,
    kind: 'code',
    title: '__neg__, __sub__, __eq__ en une ligne chacune',
    stars: 2,
    source: 'TP Pb2 B7-B8',
    tags: ['classe'],
    statement: md`
La classe dispose de §__add__§. Écrire, **en une ligne chacune** :
- §__neg__§ (opposé) ;
- §__sub__§ (différence), en réutilisant §+§ et l'opposé ;
- §__eq__§ (égalité).

'''
>>> -Poly([2, 2, 3])
Poly([-2, -2, -3])
>>> Poly([2, 3]) - Poly([0, 3])
Poly([2])
>>> Poly([2, 5]) == Poly([2, 5, 0])
True
'''
`,
    starter: POLY_BASE + py`
    def __add__(self, other):
        n = max(len(self.coeff), len(other.coeff))
        a = self.coeff + [0] * (n - len(self.coeff))
        b = other.coeff + [0] * (n - len(other.coeff))
        return Poly([a[i] + b[i] for i in range(n)])

    def __neg__(self):
        pass

    def __sub__(self, other):
        pass

    def __eq__(self, other):
        pass
`,
    tests: [
      { expr: '-Poly([2, 2, 3])', expected: 'Poly([-2, -2, -3])', mode: 'repr' },
      { expr: '-Poly([])', expected: 'Poly([])', mode: 'repr' },
      { expr: 'Poly([2, 2, 3]) - Poly([0, 1, 2])', expected: 'Poly([2, 1, 1])', mode: 'repr' },
      { expr: 'Poly([2, 3]) - Poly([0, 3])', expected: 'Poly([2])', mode: 'repr' },
      { expr: 'Poly([1, 2]) - Poly([1, 2])', expected: 'Poly([])', mode: 'repr' },
      { expr: 'Poly([2, 5]) == Poly([2, 5, 0])', expected: 'True' },
      { expr: 'Poly([1, 2]) == Poly([2, 1])', expected: 'False' },
      { expr: 'Poly([]) == Poly([0])', expected: 'True' },
    ],
    solution: md`
'''python
${POLY_BASE}
    def __add__(self, other):
        n = max(len(self.coeff), len(other.coeff))
        a = self.coeff + [0] * (n - len(self.coeff))
        b = other.coeff + [0] * (n - len(other.coeff))
        return Poly([a[i] + b[i] for i in range(n)])

    def __neg__(self):
        return Poly([-a for a in self.coeff])

    def __sub__(self, other):
        return self + (-other)

    def __eq__(self, other):
        return self.coeff == other.coeff
'''
§__eq__§ fonctionne en une ligne **parce que** §__init__§ garantit une représentation unique (pas de 0 finaux).
`,
  },
  {
    id: 'p2-derive',
    problem: 2,
    kind: 'code',
    title: 'derive',
    stars: 3,
    source: 'TP Pb2 D1 / Final 2025',
    tags: ['classe'],
    statement: md`
Écrire la méthode §derive§ qui renvoie le polynôme dérivé.

'''
>>> Poly([3, 1, 4]).derive()
Poly([1, 8])
>>> Poly([5]).derive()
Poly([])
'''
`,
    reminder: md`$\left(\sum_{k=0}^d a_k X^k\right)' = \sum_{k=1}^d k\,a_k X^{k-1}$ : la liste §[a0, a1, ..., ad]§ devient §[1*a1, 2*a2, ..., d*ad]§.`,
    starter: POLY_BASE + py`
    def derive(self):
        pass
`,
    tests: [
      { expr: 'Poly([3, 1, 4]).derive()', expected: 'Poly([1, 8])', mode: 'repr' },
      { expr: 'Poly([7, 2]).derive()', expected: 'Poly([2])', mode: 'repr' },
      { expr: 'Poly([5]).derive()', expected: 'Poly([])', mode: 'repr' },
      { expr: 'Poly([]).derive()', expected: 'Poly([])', mode: 'repr' },
      { expr: 'Poly([0, 0, 1]).derive()', expected: 'Poly([0, 2])', mode: 'repr' },
      { expr: 'Poly([3, 0, -2, 1]).derive()', expected: 'Poly([0, -4, 3])', mode: 'repr' },
    ],
    solution: md`
'''python
${POLY_BASE}
    def derive(self):
        return Poly([k * self.coeff[k] for k in range(1, len(self.coeff))])
'''
Le terme constant disparaît ; le résultat a un coefficient de moins.
`,
  },
  {
    id: 'p2-evalfast',
    problem: 2,
    kind: 'code',
    title: 'evalFast : recycler les puissances de x',
    stars: 2,
    source: 'TP Pb2 C2',
    tags: ['efficacité'],
    statement: md`
Écrire §evalFast(x)§, qui calcule $P(x)$ avec un nombre **linéaire** d'opérations en recyclant $x^{k-1}$ pour obtenir $x^k$. **Interdit** : §**§ et §pow§.

'''
>>> Poly([2, 2, 3]).evalFast(-3)
23
'''
`,
    starter: POLY_BASE + py`
    def evalFast(self, x):
        pass
`,
    forbid: ['**', 'pow'],
    tests: [
      { expr: 'Poly([2, 2, 3]).evalFast(-3)', expected: '23' },
      { expr: 'Poly([-3, 2, -5]).evalFast(-3)', expected: '-54' },
      { expr: 'Poly([0, -2, -1, 1, -2]).evalFast(-3)', expected: '-192' },
      { expr: 'Poly([]).evalFast(-3)', expected: '0' },
      { expr: 'Poly([1, 1, 1, 1]).evalFast(2)', expected: '15' },
    ],
    solution: md`
'''python
${POLY_BASE}
    def evalFast(self, x):
        s = 0
        puissance = 1            # x^0
        for a in self.coeff:
            s += a * puissance
            puissance *= x       # x^k -> x^(k+1)
        return s
'''
Coût pour un degré $d$ : environ $2d$ multiplications et $d$ additions.
`,
  },
  {
    id: 'p2-horner',
    problem: 2,
    kind: 'code',
    title: 'evalHorner (itératif)',
    stars: 3,
    source: 'TP Pb2 C3',
    tags: ['efficacité', 'horner'],
    statement: md`
Écrire §evalHorner(x)§, qui évalue le polynôme par la méthode de Horner, **sans** §**§ ni §pow§.

'''
>>> Poly([1, 2, 3]).evalHorner(2)
17
'''
`,
    reminder: RAPPEL_HORNER,
    starter: POLY_BASE + py`
    def evalHorner(self, x):
        pass
`,
    forbid: ['**', 'pow'],
    tests: [
      { expr: 'Poly([1, 2, 3]).evalHorner(2)', expected: '17' },
      { expr: 'Poly([2, 2, 3]).evalHorner(-3)', expected: '23' },
      { expr: 'Poly([-3, 2, -5]).evalHorner(-3)', expected: '-54' },
      { expr: 'Poly([0, -2, -1, 1, -2]).evalHorner(-3)', expected: '-192' },
      { expr: 'Poly([]).evalHorner(-3)', expected: '0' },
      { expr: 'Poly([7]).evalHorner(100)', expected: '7' },
    ],
    solution: md`
'''python
${POLY_BASE}
    def evalHorner(self, x):
        r = 0
        for a in reversed(self.coeff):   # du plus haut degré au terme constant
            r = r * x + a
        return r
'''
Pour §[1, 2, 3]§ et $x = 2$ : $r = 3$, puis $3 \cdot 2 + 2 = 8$, puis $8 \cdot 2 + 1 = 17$. Coût : $d$ multiplications et $d$ additions (plus une multiplication par 0 au départ, sans importance).
`,
  },
  {
    id: 'p2-horner-rec',
    problem: 2,
    kind: 'code',
    title: 'Horner récursif',
    stars: 2,
    source: 'TP Pb2 C3',
    tags: ['horner', 'récursivité'],
    statement: md`
En utilisant l'écriture récursive $P(X) = p_0 + X\,Q(X)$, où $Q$ a pour coefficients §coeff[1:]§, écrire une fonction **récursive** §horner_rec(coeffs, x)§ qui prend une liste de coefficients et renvoie $P(x)$.

'''
>>> horner_rec([1, 2, 3], 2)
17
>>> horner_rec([], 5)
0
'''
`,
    reminder: RAPPEL_HORNER,
    starter: py`
def horner_rec(coeffs, x):
    pass
`,
    forbid: ['**', 'pow'],
    tests: [
      { expr: 'horner_rec([1, 2, 3], 2)', expected: '17' },
      { expr: 'horner_rec([], 5)', expected: '0' },
      { expr: 'horner_rec([4], 5)', expected: '4' },
      { expr: 'horner_rec([0, -2, -1, 1, -2], -3)', expected: '-192' },
      {
        label: 'la fonction est récursive',
        script: py`
g = horner_rec.__globals__
orig = g['horner_rec']
calls = [0]
def spy(c, x):
    calls[0] += 1
    return orig(c, x)
g['horner_rec'] = spy
orig([1, 2, 3], 2)
g['horner_rec'] = orig
ok = calls[0] >= 1
got = calls[0]`,
      },
    ],
    solution: md`
'''python
def horner_rec(coeffs, x):
    if not coeffs:
        return 0
    return coeffs[0] + x * horner_rec(coeffs[1:], x)
'''
Cas de base : la liste vide vaut 0. Remarque : §coeffs[1:]§ copie la liste à chaque appel. On peut passer un indice §i§ à la place pour éviter ces copies.
`,
  },
  {
    id: 'p2-compose',
    problem: 2,
    kind: 'code',
    title: 'compose : P(Q(X))',
    stars: 2,
    source: 'TP Pb2 D2',
    tags: ['horner', 'classe'],
    statement: md`
La classe §Poly§ fournie gère §+§ et §*§ (y compris avec un nombre : §P * 2§, §P + 1§). Écrire la **fonction** §compose(P, Q)§ qui renvoie le polynôme $P(Q(X))$.

**Indication** : appliquer Horner en remplaçant $x$ par le polynôme $Q$.

'''
>>> compose(Poly([3, 1, 4]), Poly([2, 7, 1]))
Poly([21, 119, 213, 56, 4])
>>> compose(Poly([0, 0, 1]), Poly([1, 1]))
Poly([1, 2, 1])
'''
`,
    reminder: RAPPEL_HORNER,
    setup: POLY_SETUP,
    starter: py`
# La classe Poly est fournie (+, * avec polynômes ou nombres).

def compose(P, Q):
    pass
`,
    tests: [
      { expr: 'compose(Poly([3, 1, 4]), Poly([2, 7, 1]))', expected: 'Poly([21, 119, 213, 56, 4])', mode: 'repr' },
      { expr: 'compose(Poly([0, 1]), Poly([2, 7, 1]))', expected: 'Poly([2, 7, 1])', mode: 'repr' },
      { expr: 'compose(Poly([1, 1]), Poly([1, 1]))', expected: 'Poly([2, 1])', mode: 'repr' },
      { expr: 'compose(Poly([5]), Poly([2, 7, 1]))', expected: 'Poly([5])', mode: 'repr' },
      { expr: 'compose(Poly([3, 1, 4]), Poly([3]))', expected: 'Poly([42])', mode: 'repr' },
      { expr: 'compose(Poly([0, 0, 1]), Poly([1, 1]))', expected: 'Poly([1, 2, 1])', mode: 'repr' },
      { expr: 'compose(Poly([]), Poly([2, 7, 1]))', expected: 'Poly([])', mode: 'repr' },
    ],
    solution: md`
'''python
def compose(P, Q):
    R = Poly([])
    for a in reversed(P.coeff):
        R = R * Q + a
    return R
'''
C'est Horner, où le nombre $x$ est remplacé par le polynôme $Q$ : $R \leftarrow R \cdot Q + a_k$. Le §+ a§ passe par §__add__§ avec un nombre.
`,
  },
  {
    id: 'p2-str',
    problem: 2,
    kind: 'code',
    title: '__str__ : affichage usuel',
    stars: 1,
    source: 'TP Pb2 B9',
    tags: ['classe', 'affichage'],
    statement: md`
Écrire §__str__§, qui affiche le polynôme du plus petit au plus grand degré, en gérant les coefficients négatifs, $\pm 1$ et $0$, et les termes de degré 0 et 1.

'''
>>> print(Poly([2, 2, 3]))
2+2X+3X^2
>>> print(Poly([0, -2, -1, 1, -2]))
-2X-X^2+X^3-2X^4
>>> print(Poly([0, 1]))
X
>>> print(Poly([]))
0
'''
`,
    starter: POLY_BASE + py`
    def __str__(self):
        pass
`,
    tests: [
      { expr: 'str(Poly([2, 2, 3]))', expected: '2+2X+3X^2', mode: 'str' },
      { expr: 'str(Poly([2, 5, 0]))', expected: '2+5X', mode: 'str' },
      { expr: 'str(Poly([-3, 2, -5]))', expected: '-3+2X-5X^2', mode: 'str' },
      { expr: 'str(Poly([0, -2, -1, 1, -2]))', expected: '-2X-X^2+X^3-2X^4', mode: 'str' },
      { expr: 'str(Poly([0, 1]))', expected: 'X', mode: 'str' },
      { expr: 'str(Poly([-1]))', expected: '-1', mode: 'str' },
      { expr: 'str(Poly([]))', expected: '0', mode: 'str' },
      { expr: 'str(Poly([1, 0, 0, 1]))', expected: '1+X^3', mode: 'str' },
    ],
    solution: md`
'''python
${POLY_BASE}
    def __str__(self):
        if not self.coeff:
            return "0"
        s = ""
        for k, a in enumerate(self.coeff):
            if a == 0:
                continue
            # signe
            if a < 0:
                s += "-"
            elif s:                 # pas de + en tête
                s += "+"
            # valeur absolue (on omet 1 devant X)
            if abs(a) != 1 or k == 0:
                s += str(abs(a))
            # partie en X
            if k == 1:
                s += "X"
            elif k > 1:
                s += f"X^{k}"
        return s
'''
`,
  },
  {
    id: 'p2-radd-rmul',
    problem: 2,
    kind: 'code',
    title: 'Opérations avec un nombre (__radd__, __rmul__)',
    stars: 1,
    source: 'TP Pb2 B5-B6',
    tags: ['classe'],
    statement: md`
Modifier §__add__§ et §__mul__§ pour qu'un nombre §c§ soit traité comme le polynôme constant §Poly([c])§, puis ajouter §__radd__§ et §__rmul__§ pour que §1 + P§ et §2 * P§ fonctionnent.

'''
>>> Poly([1, 1]) + 3
Poly([4, 1])
>>> 2 * Poly([1, 1])
Poly([2, 2])
>>> 1 + Poly([0, 1])
Poly([1, 1])
'''
`,
    starter: POLY_BASE + py`
    def __add__(self, other):
        n = max(len(self.coeff), len(other.coeff))
        a = self.coeff + [0] * (n - len(self.coeff))
        b = other.coeff + [0] * (n - len(other.coeff))
        return Poly([a[i] + b[i] for i in range(n)])

    def __mul__(self, other):
        if not self.coeff or not other.coeff:
            return Poly([])
        res = [0] * (len(self.coeff) + len(other.coeff) - 1)
        for i, a in enumerate(self.coeff):
            for j, b in enumerate(other.coeff):
                res[i + j] += a * b
        return Poly(res)
`,
    tests: [
      { expr: 'Poly([1, 1]) + 3', expected: 'Poly([4, 1])', mode: 'repr' },
      { expr: '3 + Poly([1, 1])', expected: 'Poly([4, 1])', mode: 'repr' },
      { expr: '2 * Poly([1, 1])', expected: 'Poly([2, 2])', mode: 'repr' },
      { expr: 'Poly([1, 1]) * 0', expected: 'Poly([])', mode: 'repr' },
      { expr: 'Poly([1, 1]) + Poly([0, 2])', expected: 'Poly([1, 3])', mode: 'repr' },
    ],
    solution: md`
'''python
${POLY_BASE}
    def __add__(self, other):
        if isinstance(other, (int, float)):
            other = Poly([other])
        n = max(len(self.coeff), len(other.coeff))
        a = self.coeff + [0] * (n - len(self.coeff))
        b = other.coeff + [0] * (n - len(other.coeff))
        return Poly([a[i] + b[i] for i in range(n)])

    def __radd__(self, other):      # other + self, où other n'est pas un Poly
        return self + other

    def __mul__(self, other):
        if isinstance(other, (int, float)):
            other = Poly([other])
        if not self.coeff or not other.coeff:
            return Poly([])
        res = [0] * (len(self.coeff) + len(other.coeff) - 1)
        for i, a in enumerate(self.coeff):
            for j, b in enumerate(other.coeff):
                res[i + j] += a * b
        return Poly(res)

    def __rmul__(self, other):
        return self * other
'''
Python essaie d'abord §(3).__add__(P)§, qui échoue, puis §P.__radd__(3)§.
`,
  },
  {
    id: 'p2-dichotomie',
    problem: 2,
    kind: 'code',
    title: 'Dichotomie sur un polynôme',
    stars: 2,
    source: 'TP Pb2 E',
    tags: ['racines', 'TVI'],
    statement: md`
On suppose que $P(a)$ et $P(b)$ sont de signes opposés ($a < b$). Écrire §dichotomie(P, a, b, eps)§, qui renvoie une approximation à §eps§ près d'une racine de §P§ dans $[a, b]$ (§P.eval(x)§ est disponible).

'''
>>> dichotomie(Poly([-2, 0, 1]), 0, 2, 1e-9)   # racine de X^2 - 2
1.4142135619...
'''
`,
    reminder: md`
**TVI** : si $f$ est continue sur $[a, b]$ et $f(a)f(b) < 0$, alors $f$ s'annule dans $]a, b[$.
**Dichotomie** : on coupe en $m = \frac{a+b}{2}$ et on garde la moitié où le signe change. Après $k$ étapes, l'intervalle mesure $\frac{b-a}{2^k}$, donc il faut $\log_2\frac{b-a}{\varepsilon}$ étapes.
`,
    setup: POLY_SETUP,
    starter: py`
def dichotomie(P, a, b, eps):
    pass
`,
    tests: [
      { expr: 'dichotomie(Poly([-2, 0, 1]), 0, 2, 1e-9)', expected: '2 ** 0.5', mode: 'approx', tol: 1e-8 },
      { expr: 'dichotomie(Poly([-3, 1]), 0, 10, 1e-9)', expected: '3', mode: 'approx', tol: 1e-8 },
      { expr: 'dichotomie(Poly([6, -11, 6, -1]), 0.5, 1.5, 1e-9)', expected: '1', mode: 'approx', tol: 1e-8 },
      { expr: 'dichotomie(Poly([2, 0, -1]), 0, 2, 1e-9)', expected: '2 ** 0.5', mode: 'approx', tol: 1e-8 },
    ],
    solution: md`
'''python
def dichotomie(P, a, b, eps):
    while b - a > eps:
        m = (a + b) / 2
        if P.eval(a) * P.eval(m) <= 0:   # changement de signe dans [a, m]
            b = m
        else:
            a = m
    return (a + b) / 2
'''
Ça marche aussi si $P(a) > 0 > P(b)$, puisqu'on teste le **produit** des signes.
`,
  },
  {
    id: 'p2-borne',
    problem: 2,
    kind: 'code',
    title: 'Borne des racines',
    stars: 1,
    source: 'TP Pb2 E',
    tags: ['racines'],
    statement: md`
Pour $A = \sum_{k=0}^d a_k X^k$ non constant, toute racine $r$ vérifie $|r| \le \max\left(\dfrac{s}{|a_d|}, 1\right)$ avec $s = |a_0| + \dots + |a_{d-1}|$.

Écrire §borne_racines(P)§ qui renvoie cette borne.

'''
>>> borne_racines(Poly([-6, 11, -6, 1]))
23.0
>>> borne_racines(Poly([0, 0, 2]))
1
'''
`,
    setup: POLY_SETUP,
    starter: py`
def borne_racines(P):
    pass
`,
    tests: [
      { expr: 'borne_racines(Poly([-6, 11, -6, 1]))', expected: '23', mode: 'approx' },
      { expr: 'borne_racines(Poly([0, 0, 2]))', expected: '1', mode: 'approx' },
      { expr: 'borne_racines(Poly([-1, 0, 1]))', expected: '1', mode: 'approx' },
      { expr: 'borne_racines(Poly([4, -4, 2]))', expected: '4', mode: 'approx' },
    ],
    solution: md`
'''python
def borne_racines(P):
    a = P.coeff
    s = sum(abs(c) for c in a[:-1])
    return max(s / abs(a[-1]), 1)
'''
`,
  },
  {
    id: 'p2-depuis-racines',
    problem: 2,
    kind: 'code',
    title: 'Polynôme à partir de ses racines',
    stars: 1,
    source: 'Variante (utilise __mul__)',
    tags: ['classe'],
    statement: md`
Avec la classe §Poly§ fournie, écrire §depuis_racines(racines)§, qui renvoie le polynôme unitaire $\prod_i (X - r_i)$.

'''
>>> depuis_racines([1, 2, 3])
Poly([-6, 11, -6, 1])
>>> depuis_racines([])
Poly([1])
'''
`,
    setup: POLY_SETUP,
    starter: py`
def depuis_racines(racines):
    pass
`,
    tests: [
      { expr: 'depuis_racines([1, 2, 3])', expected: 'Poly([-6, 11, -6, 1])', mode: 'repr' },
      { expr: 'depuis_racines([])', expected: 'Poly([1])', mode: 'repr' },
      { expr: 'depuis_racines([0])', expected: 'Poly([0, 1])', mode: 'repr' },
      { expr: 'depuis_racines([1, -1])', expected: 'Poly([-1, 0, 1])', mode: 'repr' },
    ],
    solution: md`
'''python
def depuis_racines(racines):
    P = Poly([1])
    for r in racines:
        P = P * Poly([-r, 1])     # X - r
    return P
'''
`,
  },

  // ───────────────────────────── MATHS ─────────────────────────────
  {
    id: 'p2-m-calculs',
    problem: 2,
    kind: 'math',
    title: 'P+Q, P+R, P×Q (annale final 2025)',
    stars: 3,
    source: 'TP Pb2 A / Final 2025-26 Ex1.1',
    tags: ['calcul'],
    statement: md`
Avec $P(X) = X^3 - X$, $Q(X) = 2X^2 + X + 1$ et $R(X) = -X^3 + X^2 + 3$, calculer $P + Q$, $P + R$ et $P \times Q$, et donner leurs degrés.
`,
    reminder: RAPPEL_OPS,
    answer: md`$P+Q = X^3 + 2X^2 + 1$ (deg 3) · $P+R = X^2 - X + 3$ (deg 2) · $PQ = 2X^5 + X^4 - X^3 - X^2 - X$ (deg 5)`,
    solution: md`
- $P + Q = X^3 + 2X^2 + (1 - 1)X + 1 = X^3 + 2X^2 + 1$, degré 3.
- $P + R = (X^3 - X^3) + X^2 - X + 3 = X^2 - X + 3$, degré **2** : les termes dominants s'annulent.
- $P \times Q = X^3(2X^2 + X + 1) - X(2X^2 + X + 1) = 2X^5 + X^4 + X^3 - 2X^3 - X^2 - X$
  $= 2X^5 + X^4 - X^3 - X^2 - X$, degré $5 = 3 + 2$.
`,
  },
  {
    id: 'p2-m-calculs2',
    problem: 2,
    kind: 'math',
    title: 'Somme et produit (exemple de la classe Poly)',
    stars: 3,
    source: 'Final 2025-26 (doctests)',
    tags: ['calcul'],
    statement: md`
Soit $P = 2 + X - X^2$ et $Q = 2X + X^2$.
1. Calculer $P + Q$ et $P \times Q$.
2. Écrire les listes de coefficients correspondantes (représentation §Poly§).
3. Calculer $P'$ et la valeur $P(2)$.
`,
    reminder: RAPPEL_OPS,
    answer: md`$P + Q = 2 + 3X$ → §[2, 3]§ ; $PQ = 4X + 4X^2 - X^3 - X^4$ → §[0, 4, 4, -1, -1]§ ; $P' = 1 - 2X$ ; $P(2) = 0$.`,
    solution: md`
1. $P + Q = 2 + 3X$ (les $X^2$ s'annulent).
   $PQ = (2 + X - X^2)(2X + X^2) = 4X + 2X^2 + 2X^2 + X^3 - 2X^3 - X^4 = 4X + 4X^2 - X^3 - X^4$.
2. §Poly([2, 3])§ et §Poly([0, 4, 4, -1, -1])§.
3. $P' = 1 - 2X$ (§[1, -2]§) ; $P(2) = 2 + 2 - 4 = 0$.
`,
  },
  {
    id: 'p2-m-valeurs',
    problem: 2,
    kind: 'math',
    title: 'Tableau de valeurs',
    stars: 2,
    source: 'TP Pb2 A',
    tags: ['calcul'],
    statement: md`
Avec $P = X^3 - X$, $Q = 2X^2 + X + 1$ et $R = -X^3 + X^2 + 3$, calculer $P(x)$, $Q(x)$ et $R(x)$ pour $x \in \{-1, 0, 1, 2\}$.
`,
    answer: md`
| $x$ | $P$ | $Q$ | $R$ |
|---|---|---|---|
| −1 | 0 | 2 | 5 |
| 0 | 0 | 1 | 3 |
| 1 | 0 | 4 | 3 |
| 2 | 6 | 11 | −1 |
`,
    solution: md`
| $x$ | $P(x) = x^3 - x$ | $Q(x) = 2x^2 + x + 1$ | $R(x) = -x^3 + x^2 + 3$ |
|---|---|---|---|
| $-1$ | $-1 + 1 = 0$ | $2 - 1 + 1 = 2$ | $1 + 1 + 3 = 5$ |
| $0$ | $0$ | $1$ | $3$ |
| $1$ | $0$ | $4$ | $3$ |
| $2$ | $8 - 2 = 6$ | $8 + 2 + 1 = 11$ | $-8 + 4 + 3 = -1$ |

Astuce : $P(1)$ = somme des coefficients.
`,
  },
  {
    id: 'p2-m-zeros-finaux',
    problem: 2,
    kind: 'math',
    title: 'Pourquoi retirer les 0 finaux ?',
    stars: 1,
    source: 'TP Pb2 B1',
    tags: ['représentation'],
    statement: md`
Pourquoi est-il une mauvaise idée de conserver des 0 à la fin de la liste des coefficients (par exemple §[2, 5, 0]§) ? Donner deux problèmes concrets.
`,
    answer: md`La représentation n'est plus unique : §degre§ (§len - 1§) est faux, et §==§ (comparaison des listes) échoue pour deux polynômes égaux.`,
    solution: md`
§[2, 5, 0]§ et §[2, 5]§ représentent le même polynôme $2 + 5X$, mais :
1. §degre§ basé sur §len(coeff) - 1§ renverrait **2** au lieu de 1 ;
2. §__eq__§ basé sur §self.coeff == other.coeff§ dirait que les deux sont **différents**.

Retirer les 0 finaux dans §__init__§ garantit une représentation **unique** (invariant), ce qui rend ces méthodes triviales.
`,
  },
  {
    id: 'p2-m-somme',
    problem: 2,
    kind: 'math',
    title: 'Coefficients et degré de A + B',
    stars: 3,
    source: 'TP Pb2 B5 / Final 2025-26 Ex1.2b',
    tags: ['degré'],
    statement: md`
Soit $A = \sum_{k=0}^d a_k X^k$ et $B = \sum_{k=0}^e b_k X^k$ deux polynômes non nuls de degrés $d$ et $e$.
1. Quels sont les coefficients de $A + B$ ?
2. Que peut-on dire du degré de $A + B$ ? Distinguer $d \ne e$ et $d = e$, et donner un contre-exemple.
`,
    answer: md`Coefficient $a_k + b_k$ ; si $d \neq e$, $\deg = \max(d, e)$ ; si $d = e$, $\deg \le d$ (peut baisser, ex. $(X+1) + (-X+1) = 2$).`,
    solution: md`
1. Le coefficient de $X^k$ est $a_k + b_k$, en posant $a_k = 0$ pour $k > d$ et $b_k = 0$ pour $k > e$.
2. Toujours $\deg(A + B) \le \max(d, e)$.
   - Si $d \ne e$ : égalité, $\deg(A + B) = \max(d, e)$ (le terme dominant ne peut pas être compensé).
   - Si $d = e$ : le coefficient $a_d + b_d$ peut s'annuler. Exemple : $(X + 1) + (-X + 1) = 2$, de degré 0. On peut même obtenir le polynôme nul (degré $-1$).
`,
  },
  {
    id: 'p2-m-produit',
    problem: 2,
    kind: 'math',
    title: 'Coefficients et degré de A × B',
    stars: 3,
    source: 'TP Pb2 B6 / Final 2025-26 Ex1.2a',
    tags: ['degré'],
    statement: md`
Avec $A$ et $B$ non nuls de degrés $d$ et $e$ :
1. Donner le coefficient de $X^k$ dans $A \times B$.
2. Quel est le degré de $A \times B$ ? Justifier.
3. Combien de multiplications de coefficients la double boucle de §__mul__§ effectue-t-elle ?
`,
    answer: md`$c_k = \sum_{i+j=k} a_i b_j$ ; $\deg(AB) = d + e$ car $a_d b_e \neq 0$ ; $(d+1)(e+1)$ multiplications.`,
    solution: md`
1. $c_k = \displaystyle\sum_{i + j = k} a_i b_j = \sum_{i=0}^{k} a_i b_{k-i}$ (avec les coefficients hors bornes égaux à 0).
2. Le terme de plus haut degré est $a_d b_e X^{d+e}$ et $a_d b_e \ne 0$ (produit de deux réels non nuls), donc $\deg(AB) = d + e$.
3. Chaque couple $(i, j)$ donne une multiplication : $(d + 1)(e + 1)$.
`,
  },
  {
    id: 'p2-m-cout-naif',
    problem: 2,
    kind: 'math',
    title: "Coût de l'évaluation naïve",
    stars: 3,
    source: 'TP Pb2 C1',
    tags: ['complexité'],
    statement: md`
On évalue $P = \sum_{k=0}^d a_k x^k$ naïvement : pour chaque $k$, on calcule $x^k$ **en partant de zéro** ($k - 1$ multiplications), puis $a_k \times x^k$, et on additionne.

Combien de multiplications et d'additions au total ? Donner des valeurs exactes.
`,
    answer: md`$d$ additions ; $\sum_{k=1}^d \big((k-1) + 1\big) = \frac{d(d+1)}{2}$ multiplications.`,
    solution: md`
- **Additions** : on additionne $d + 1$ termes, soit $d$ additions.
- **Multiplications** : pour $k \ge 1$, $x^k$ coûte $k - 1$ multiplications, plus 1 pour $a_k \times x^k$, soit $k$ multiplications. Total :
$$\sum_{k=1}^{d} k = \frac{d(d+1)}{2}.$$

Vérification pour $d = 2$ : $a_1 x$ (1) + $x \cdot x$ puis $\times a_2$ (2), soit $3 = \frac{2 \cdot 3}{2}$. Complexité **quadratique**.
`,
  },
  {
    id: 'p2-m-cout-fast-horner',
    problem: 2,
    kind: 'math',
    title: 'Coût de evalFast et de Horner',
    stars: 3,
    source: 'TP Pb2 C2-C3',
    tags: ['complexité', 'horner'],
    statement: md`
Pour $P$ de degré $d$, combien de multiplications et d'additions faut-il :
1. avec §evalFast§ (on recycle $x^{k-1}$ pour obtenir $x^k$) ?
2. avec Horner ?

Laquelle choisir pour évaluer $P_n = \sum_{k=0}^n k X^k$ en $x = 3$ pour $n$ grand ?
`,
    reminder: RAPPEL_HORNER,
    answer: md`evalFast : $\approx 2d$ mult. et $d$ add. ; Horner : $d$ mult. et $d$ add. ; Horner (ou evalFast) plutôt que le naïf quadratique.`,
    solution: md`
1. §evalFast§ : à chaque degré $k = 1, \dots, d$, une multiplication pour $x^k = x^{k-1} \cdot x$ et une pour $a_k x^k$, soit $2d$ multiplications et $d$ additions.
2. Horner : $P(x) = a_0 + x(a_1 + x(a_2 + \dots + x\,a_d))$, une multiplication et une addition par degré, soit **$d$ multiplications et $d$ additions**.

Les deux sont linéaires. Horner est le plus économe, et il bat largement le naïf en $\frac{d(d+1)}{2}$. Pour $x = 3$ et $n$ grand, les entiers deviennent énormes : chaque multiplication coûte cher, ce qui rend le nombre d'opérations encore plus important.
`,
  },
  {
    id: 'p2-m-horner-main',
    problem: 2,
    kind: 'math',
    title: 'Horner à la main',
    stars: 3,
    source: 'TP Pb2 C3',
    tags: ['horner', 'calcul'],
    statement: md`
Soit $P = 2 - 3X + X^3 + 2X^4$.
1. Écrire $P$ sous forme de Horner.
2. Calculer $P(2)$ par la méthode de Horner en donnant les valeurs intermédiaires.
`,
    reminder: RAPPEL_HORNER,
    answer: md`$P = 2 + X(-3 + X(0 + X(1 + 2X)))$ ; étapes $2, 5, 10, 17, 36$ : $P(2) = 36$.`,
    solution: md`
Coefficients du terme constant au plus haut degré : §[2, -3, 0, 1, 2]§.
1. $P = 2 + X\Big(-3 + X\big(0 + X(1 + 2X)\big)\Big)$
2. On part du coefficient dominant :
   - $r = 2$
   - $r = 2 \cdot 2 + 1 = 5$
   - $r = 5 \cdot 2 + 0 = 10$
   - $r = 10 \cdot 2 - 3 = 17$
   - $r = 17 \cdot 2 + 2 = 36$

Vérification : $2 - 6 + 8 + 32 = 36$.
`,
  },
  {
    id: 'p2-m-derivee',
    problem: 2,
    kind: 'math',
    title: 'Coefficients et degré de la dérivée',
    stars: 3,
    source: 'TP Pb2 D1',
    tags: ['dérivée', 'degré'],
    statement: md`
Soit $A = \sum_{k=0}^d a_k X^k$ de degré $d$. Donner les coefficients de $A'$ et son degré (attention au cas $d = 0$).
`,
    answer: md`$A' = \sum_{k=1}^d k\,a_k X^{k-1}$ ; degré $d - 1$ si $d \ge 1$ ; si $d = 0$, $A' = 0$, de degré $-1$ par convention.`,
    solution: md`
$A' = \displaystyle\sum_{k=1}^{d} k\,a_k X^{k-1}$ : la liste §[a0, a1, ..., ad]§ devient §[1·a1, 2·a2, ..., d·ad]§.

- Si $d \ge 1$ : le coefficient dominant $d\,a_d \ne 0$, donc $\deg A' = d - 1$.
- Si $d = 0$ ($A$ constant) : $A' = 0$, de degré $-1$ (convention du TP).
`,
  },
  {
    id: 'p2-m-composee',
    problem: 2,
    kind: 'math',
    title: 'Degré de la composée, non-commutativité',
    stars: 2,
    source: 'TP Pb2 D2',
    tags: ['degré'],
    statement: md`
Soit $A$ de degré $d \ge 1$ et $B$ de degré $e \ge 1$.
1. Quel est le degré de $A(B(X))$ ? Et celui de $B(A(X))$ ?
2. Ces deux polynômes sont-ils égaux en général ? Donner un contre-exemple.
`,
    answer: md`$d \cdot e$ dans les deux cas ; non : $A = X^2$, $B = X + 1$ donnent $X^2 + 2X + 1 \ne X^2 + 1$.`,
    solution: md`
1. $A(B) = \sum a_k B^k$ ; le terme $a_d B^d$ est de degré $d e$ et domine tous les autres (degrés $k e < d e$). Donc $\deg A(B) = de$, et de même $\deg B(A) = ed$.
2. Non : la composition n'est pas commutative. Avec $A = X^2$ et $B = X + 1$ :
$A(B) = (X+1)^2 = X^2 + 2X + 1$ mais $B(A) = X^2 + 1$.
`,
  },
  {
    id: 'p2-m-tvi',
    problem: 2,
    kind: 'math',
    title: 'Théorème des valeurs intermédiaires',
    stars: 1,
    source: 'TP Pb2 E',
    tags: ['TVI'],
    statement: md`
Énoncer le théorème des valeurs intermédiaires, puis son corollaire sur les changements de signe. Pourquoi s'applique-t-il à tout polynôme ?
`,
    answer: md`$f$ continue sur $[a, b]$ prend toute valeur entre $f(a)$ et $f(b)$ ; si $f(a)f(b) < 0$, $f$ s'annule dans $]a, b[$ ; un polynôme est continu sur $\mathbb{R}$.`,
    solution: md`
**TVI** : si $f$ est continue sur $[a, b]$, alors pour tout $y$ compris entre $f(a)$ et $f(b)$, il existe $c \in [a, b]$ tel que $f(c) = y$.

**Corollaire** : si $f(a)$ et $f(b)$ sont de signes opposés ($f(a) f(b) < 0$), alors $f$ s'annule au moins une fois dans $]a, b[$.

Un polynôme est continu sur $\mathbb{R}$ (somme et produit de fonctions continues), donc le TVI s'applique. C'est la base de la dichotomie.
`,
  },
  {
    id: 'p2-m-bigint',
    problem: 2,
    kind: 'math',
    title: 'Pourquoi P_n(3) coûte plus que linéaire',
    stars: 1,
    source: 'TP Pb2 C3',
    tags: ['complexité'],
    statement: md`
Expérimentalement, évaluer $P_n = \sum_{k=0}^n kX^k$ en $x = 1$ prend un temps linéaire en $n$ avec Horner, mais en $x = 3$ le temps croît bien plus vite. Expliquer.
`,
    answer: md`Avec $x = 3$, les valeurs intermédiaires sont des entiers de l'ordre de $3^n$ ($\approx 0.48\,n$ chiffres) : une multiplication n'est plus en temps constant.`,
    solution: md`
Le nombre d'**opérations** reste $n$, mais leur **coût** varie :
- en $x = 1$, les nombres restent petits (de l'ordre de $n^2$), donc chaque opération est en temps constant et le total est linéaire ;
- en $x = 3$, les valeurs intermédiaires sont de l'ordre de $3^k$, soit $k \log_{10} 3$ chiffres. Python manipule ces grands entiers en temps proportionnel à leur taille, donc le total est environ quadratique.
`,
  },
  {
    id: 'p2-m-borne-preuve',
    problem: 2,
    kind: 'math',
    title: 'Preuve de la borne des racines',
    stars: 1,
    source: 'TP Pb2 E',
    tags: ['preuve', 'racines'],
    statement: md`
Soit $A = \sum_{k=0}^d a_k X^k$ de degré $d \ge 1$, et $s = |a_0| + \dots + |a_{d-1}|$. Montrer que toute racine $r$ vérifie $|r| \le \max(s/|a_d|, 1)$.

*Indication : traiter le cas $|r| \le 1$, puis, si $|r| > 1$, isoler $a_d r^d$.*
`,
    answer: md`Si $|r| > 1$ : $|a_d||r|^d \le \sum_{k<d}|a_k||r|^k \le s|r|^{d-1}$, d'où $|r| \le s/|a_d|$.`,
    solution: md`
- Si $|r| \le 1$, c'est immédiat car $\max(\cdot, 1) \ge 1$.
- Si $|r| > 1$ : de $A(r) = 0$, on tire $a_d r^d = -(a_0 + a_1 r + \dots + a_{d-1} r^{d-1})$, donc
$$|a_d|\,|r|^d \le \sum_{k=0}^{d-1} |a_k|\,|r|^k \le s\,|r|^{d-1}$$
car $|r|^k \le |r|^{d-1}$ pour $k \le d - 1$ (puisque $|r| > 1$). En divisant par $|r|^{d-1} > 0$ : $|a_d|\,|r| \le s$, donc $|r| \le s/|a_d|$.
`,
  },
  {
    id: 'p2-m-racine-intervalle',
    problem: 2,
    kind: 'math',
    title: 'Racines entre deux zéros de la dérivée',
    stars: 1,
    source: 'TP Pb2 E',
    tags: ['racines', 'TVI'],
    statement: md`
Soit $s < t$ deux racines réelles **consécutives** de $A'$. À quelle condition sur $A(s)$ et $A(t)$ l'intervalle $]s, t[$ contient-il une racine de $A$ ? Peut-il en contenir plusieurs ?
`,
    answer: md`Si $A(s) A(t) < 0$ : exactement une racine ($A$ strictement monotone sur $[s, t]$). Sinon, aucune dans $]s, t[$.`,
    solution: md`
$A'$ ne s'annule pas sur $]s, t[$, et comme elle est continue, elle y garde un **signe constant** (TVI). Donc $A$ est strictement monotone sur $[s, t]$.
- Si $A(s)$ et $A(t)$ sont de signes opposés : le TVI donne au moins une racine, et la stricte monotonie en garantit **au plus une**. Il y en a donc exactement une.
- Sinon, aucune racine dans $]s, t[$.

C'est ce qui permet de trouver toutes les racines : on découpe aux racines de $A'$, puis on fait une dichotomie sur chaque intervalle.
`,
  },
]
