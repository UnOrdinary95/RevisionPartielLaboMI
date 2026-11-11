import { md, py } from './md'
import type { Exercise } from './types'

const RAPPEL_RAT = md`
- Forme irréductible $\frac{p}{q}$ : $q > 0$ et $\mathrm{pgcd}(p, q) = 1$. On divise par $g = \mathrm{pgcd}(|a|, |b|)$, puis on met le signe au numérateur.
- $\frac ab + \frac cd = \frac{ad + bc}{bd}$, $\quad \frac ab \cdot \frac cd = \frac{ac}{bd}$, $\quad \frac{a/b}{c/d} = \frac{ad}{bc}$
- Avec $b, d > 0$ : $\frac ab < \frac cd \iff ad < bc$
- §from math import gcd§ ; §gcd(-4, 6) == 2§ (toujours $\ge 0$)
`

const RAPPEL_FACT = md`
$0! = 1$ et $k! = (k-1)! \times k$ : on obtient $k!$ à partir de $(k-1)!$ avec **une seule** multiplication. Recalculer $k!$ de zéro à chaque terme coûterait $O(n^2)$.
`

const RAPPEL_NEWTON = md`
**Newton** pour résoudre $f(x) = 0$ : $x_{k+1} = x_k - \dfrac{f(x_k)}{f'(x_k)}$.
Pour $f(x) = x^2 - a$ : $x_{k+1} = \dfrac12\left(x_k + \dfrac{a}{x_k}\right)$.
Arrêt : $|x_{k+1} - x_k| < 2\cdot10^{-16}\,|x_{k+1}|$ ou 100 itérations.
`

const RAPPEL_ARCTAN = md`
$$\arctan(x) \approx \sum_{k=0}^{n-1} (-1)^k \frac{x^{2k+1}}{2k+1} = x - \frac{x^3}{3} + \frac{x^5}{5} - \cdots$$
avec une erreur $\le \dfrac{x^{2n+1}}{2n+1}$ pour $x \in [0, 1]$. On a $\arctan(1) = \frac\pi4$.
`

const RAT_BASE = py`
from math import gcd

class Rat:
    def __init__(self, num, den=1):
        g = gcd(num, den)
        if den < 0:
            g = -g
        self.num = num // g
        self.den = den // g

    def __repr__(self):
        return f"Rat({self.num}, {self.den})"

    def __str__(self):
        if self.den == 1:
            return str(self.num)
        return f"{self.num}/{self.den}"

    def __add__(self, other):
        return Rat(self.num * other.den + other.num * self.den, self.den * other.den)

    def __mul__(self, other):
        return Rat(self.num * other.num, self.den * other.den)
`

const RAT_SETUP = RAT_BASE + py`
    def __sub__(self, other):
        return Rat(self.num * other.den - other.num * self.den, self.den * other.den)

    def __neg__(self):
        return Rat(-self.num, self.den)

    def __truediv__(self, other):
        return Rat(self.num * other.den, self.den * other.num)

    def __eq__(self, other):
        return self.num == other.num and self.den == other.den
`

const ARCTAN_SETUP = py`
def approx_arctan(x, n):
    s = 0
    p = x
    for k in range(n):
        s += (-1) ** k * p / (2 * k + 1)
        p *= x * x
    return s
`

const MYSQRT_SETUP = py`
def mysqrt(x):
    if x == 0:
        return 0.0
    n = 0
    while n * n < x:
        n += 1
    xk = float(n)
    for _ in range(100):
        suiv = (xk + x / xk) / 2
        if abs(suiv - xk) < 2e-16 * abs(suiv):
            return suiv
        xk = suiv
    return xk
`

export const P3: Exercise[] = [
  // ───────────────────────────── CODE ─────────────────────────────
  {
    id: 'p3-somme-fact',
    problem: 3,
    kind: 'code',
    title: 'Somme 1 + 1/2! + … + 1/20! (annale partiel 2025)',
    stars: 3,
    source: 'Partiel 2025-26 Ex2 / TP Pb3 B.1.3',
    tags: ['efficacité', 'factorielle'],
    statement: md`
Écrire un script Python qui calcule, sous forme d'un nombre de type §float§, la somme
$$1 + \frac{1}{2!} + \frac{1}{3!} + \dots + \frac{1}{20!}$$
et la stocke dans une variable §s§.

On n'utilisera **pas** la fonction §factorial§ du module §math§. On veillera à calculer la somme de manière **efficace**. (Il n'est pas demandé de commencer par les plus petits termes.)
`,
    reminder: RAPPEL_FACT,
    starter: py`
s = 0
`,
    forbid: ['factorial'],
    tests: [
      { label: 's ≈ e − 1', expr: 's', expected: '1.718281828459045', mode: 'approx', tol: 1e-14 },
      { label: 's est un float', expr: 'type(s).__name__', expected: "'float'" },
    ],
    solution: md`
'''python
s = 0.0
fact = 1
for k in range(1, 21):
    fact = fact * k      # fact vaut maintenant k!
    s = s + 1 / fact
'''
Une multiplication et une addition par terme, soit 20 de chaque : complexité **linéaire**. La version naïve, qui recalcule $k!$ par une boucle à chaque terme, ferait $1 + 2 + \dots + 20 = 210$ multiplications.

Variante qui garde directement le terme : §terme = terme / k§.
`,
  },
  {
    id: 'p3-rat-classe',
    problem: 3,
    kind: 'code',
    title: 'Classe Rat (annale final 2024)',
    stars: 3,
    source: 'Final 2024-25 Ex1 / TP Pb3 A.2.2',
    tags: ['classe', 'rationnels'],
    statement: md`
Écrire une classe §Rat§ pour les nombres rationnels. Un objet a deux attributs : le numérateur et le dénominateur **sous forme irréductible** (dénominateur $> 0$). La classe contiendra :

- §__init__§, qui accepte n'importe quel couple numérateur-dénominateur (dénominateur non nul) ; **si aucun dénominateur n'est fourni, il vaut 1**. On pourra utiliser §gcd§ du module §math§ ;
- §__repr__§ et §__str__§ ;
- §__add__§ et §__mul__§.

'''
>>> Rat(21, 14)
Rat(3, 2)
>>> Rat(10, -15)
Rat(-2, 3)
>>> Rat(4)
Rat(4, 1)
>>> print(Rat(21, 14))
3/2
>>> print(Rat(4))
4
>>> Rat(1, 2) + Rat(5, 4)
Rat(7, 4)
>>> Rat(3, 2) * Rat(4, 7)
Rat(6, 7)
'''
`,
    reminder: RAPPEL_RAT,
    starter: py`
from math import gcd

class Rat:
    def __init__(self, num, den=1):
        pass
`,
    tests: [
      { expr: 'Rat(21, 14)', expected: 'Rat(3, 2)', mode: 'repr' },
      { expr: 'Rat(10, -15)', expected: 'Rat(-2, 3)', mode: 'repr' },
      { expr: 'Rat(-10, -15)', expected: 'Rat(2, 3)', mode: 'repr' },
      { expr: 'Rat(4)', expected: 'Rat(4, 1)', mode: 'repr' },
      { expr: 'Rat(0, -5)', expected: 'Rat(0, 1)', mode: 'repr' },
      { expr: 'str(Rat(21, 14))', expected: '3/2', mode: 'str' },
      { expr: 'str(Rat(4))', expected: '4', mode: 'str' },
      { expr: 'str(Rat(4, 2))', expected: '2', mode: 'str' },
      { expr: 'Rat(1, 2) + Rat(5, 4)', expected: 'Rat(7, 4)', mode: 'repr' },
      { expr: 'Rat(1, 3) + Rat(4, -6)', expected: 'Rat(-1, 3)', mode: 'repr' },
      { expr: 'Rat(3, 2) * Rat(4, 7)', expected: 'Rat(6, 7)', mode: 'repr' },
      { expr: 'Rat(3, 2) * Rat(2, 3)', expected: 'Rat(1, 1)', mode: 'repr' },
    ],
    forbid: ['Fraction', 'fractions'],
    solution: md`
'''python
from math import gcd

class Rat:
    def __init__(self, num, den=1):
        g = gcd(num, den)        # g > 0 (den != 0)
        if den < 0:              # signe au numérateur
            g = -g
        self.num = num // g
        self.den = den // g

    def __repr__(self):
        return f"Rat({self.num}, {self.den})"

    def __str__(self):
        if self.den == 1:
            return str(self.num)
        return f"{self.num}/{self.den}"

    def __add__(self, other):
        return Rat(self.num * other.den + other.num * self.den,
                   self.den * other.den)

    def __mul__(self, other):
        return Rat(self.num * other.num, self.den * other.den)
'''
**Points clés** : on utilise la division entière §//§ (et surtout pas §/§, qui donne un float). Diviser par §-g§ quand le dénominateur est négatif rend le dénominateur positif. Comme §__add__§ et §__mul__§ passent par le constructeur, le résultat est automatiquement réduit.
`,
  },
  {
    id: 'p3-rat-ops',
    problem: 3,
    kind: 'code',
    title: 'Rat : __sub__, __neg__, __truediv__',
    stars: 2,
    source: 'TP Pb3 A.2.2 Q2',
    tags: ['classe', 'rationnels'],
    statement: md`
Compléter la classe §Rat§ (déjà dotée de §__init__§, §__repr__§, §__str__§, §__add__§, §__mul__§) avec §__sub__§, §__neg__§ et §__truediv__§. Chaque méthode renvoie un **nouvel** objet.

'''
>>> Rat(1, 3) - Rat(4, 6)
Rat(-1, 3)
>>> -Rat(1, 2)
Rat(-1, 2)
>>> (Rat(3, 2) * Rat(5, 7) - Rat(1)) / Rat(3, 4)
Rat(2, 21)
'''
`,
    reminder: RAPPEL_RAT,
    starter: RAT_BASE + py`
    def __sub__(self, other):
        pass

    def __neg__(self):
        pass

    def __truediv__(self, other):
        pass
`,
    tests: [
      { expr: 'Rat(1, 3) - Rat(4, 6)', expected: 'Rat(-1, 3)', mode: 'repr' },
      { expr: '-Rat(1, 2)', expected: 'Rat(-1, 2)', mode: 'repr' },
      { expr: '-Rat(-3, 4)', expected: 'Rat(3, 4)', mode: 'repr' },
      { expr: 'Rat(1, 2) / Rat(3, 4)', expected: 'Rat(2, 3)', mode: 'repr' },
      { expr: 'Rat(1, 2) / Rat(-1, 4)', expected: 'Rat(-2, 1)', mode: 'repr' },
      { expr: '(Rat(3, 2) * Rat(5, 7) - Rat(1)) / Rat(3, 4)', expected: 'Rat(2, 21)', mode: 'repr' },
    ],
    solution: md`
'''python
${RAT_BASE}
    def __sub__(self, other):
        return Rat(self.num * other.den - other.num * self.den, self.den * other.den)

    def __neg__(self):
        return Rat(-self.num, self.den)

    def __truediv__(self, other):
        return Rat(self.num * other.den, self.den * other.num)
'''
Pour §__truediv__§, $\frac{a/b}{c/d} = \frac{ad}{bc}$ : le dénominateur §self.den * other.num§ peut être négatif, et c'est le constructeur qui remet le signe au numérateur.
`,
  },
  {
    id: 'p3-rat-cmp',
    problem: 3,
    kind: 'code',
    title: 'Rat : comparaisons (==, <, <=)',
    stars: 2,
    source: 'TP Pb3 A.2.2 Q3',
    tags: ['classe', 'rationnels'],
    statement: md`
Ajouter à §Rat§ les méthodes §__eq__§, §__lt__§ et §__le__§, **sans aucune division** (pas de float). Python en déduit §>§ et §>=§ automatiquement.

'''
>>> Rat(1, 2) == Rat(3, 6)
True
>>> Rat(5, 3) > Rat(11, 2)
False
>>> Rat(-1, 2) < Rat(1, 3)
True
'''
`,
    reminder: RAPPEL_RAT,
    starter: RAT_BASE + py`
    def __eq__(self, other):
        pass

    def __lt__(self, other):
        pass

    def __le__(self, other):
        pass
`,
    forbid: ['float'],
    tests: [
      { expr: 'Rat(1, 2) == Rat(3, 6)', expected: 'True' },
      { expr: 'Rat(1, 2) == Rat(1, 3)', expected: 'False' },
      { expr: 'Rat(5, 3) > Rat(11, 2)', expected: 'False' },
      { expr: 'Rat(-1, 2) < Rat(1, 3)', expected: 'True' },
      { expr: 'Rat(2, 3) <= Rat(4, 6)', expected: 'True' },
      { expr: 'Rat(2, 3) < Rat(4, 6)', expected: 'False' },
      { expr: 'Rat(7, 2) >= Rat(3)', expected: 'True' },
    ],
    solution: md`
'''python
${RAT_BASE}
    def __eq__(self, other):
        return self.num == other.num and self.den == other.den   # forme irréductible unique

    def __lt__(self, other):
        return self.num * other.den < other.num * self.den        # dénominateurs > 0

    def __le__(self, other):
        return self.num * other.den <= other.num * self.den
'''
Le produit en croix n'est valide **que** parce que les dénominateurs sont positifs, ce qu'assure l'invariant du constructeur.
`,
  },
  {
    id: 'p3-pgcd',
    problem: 3,
    kind: 'code',
    title: "pgcd par l'algorithme d'Euclide",
    stars: 2,
    source: 'TP Pb3 A.2.1',
    tags: ['arithmétique'],
    statement: md`
Écrire §pgcd(a, b)§, qui renvoie le PGCD (toujours $\ge 0$) de deux entiers, avec l'algorithme d'Euclide, **sans** utiliser §math.gcd§.

'''
>>> pgcd(308, 196)
28
>>> pgcd(-12, 18)
6
>>> pgcd(0, 5)
5
'''
`,
    reminder: md`Euclide : $\mathrm{pgcd}(a, b) = \mathrm{pgcd}(b, a \bmod b)$ et $\mathrm{pgcd}(a, 0) = |a|$.`,
    starter: py`
def pgcd(a, b):
    pass
`,
    forbid: ['gcd'],
    tests: [
      { expr: 'pgcd(308, 196)', expected: '28' },
      { expr: 'pgcd(110, 132)', expected: '22' },
      { expr: 'pgcd(-12, 18)', expected: '6' },
      { expr: 'pgcd(0, 5)', expected: '5' },
      { expr: 'pgcd(7, 0)', expected: '7' },
      { expr: 'pgcd(17, 5)', expected: '1' },
    ],
    solution: md`
'''python
def pgcd(a, b):
    a, b = abs(a), abs(b)
    while b != 0:
        a, b = b, a % b
    return a
'''
Exemple : $(308, 196) \to (196, 112) \to (112, 84) \to (84, 28) \to (28, 0)$, d'où le PGCD $28$.
`,
  },
  {
    id: 'p3-to-dec',
    problem: 3,
    kind: 'code',
    title: 'Rat.to_dec_string(n) : développement décimal tronqué',
    stars: 1,
    source: 'TP Pb3 A.2.2 Q4',
    tags: ['rationnels'],
    statement: md`
Ajouter à §Rat§ la méthode §to_dec_string(n)§ ($n \ge 1$), qui renvoie la représentation décimale **tronquée** à $n$ chiffres après la virgule.

*Indication* : effectuer la division euclidienne de $10^n |a|$ par $b$.

'''
>>> Rat(5, 4).to_dec_string(3)
'1.250'
>>> Rat(20, 7).to_dec_string(6)
'2.857142'
>>> Rat(-1, 3).to_dec_string(2)
'-0.33'
'''
`,
    reminder: RAPPEL_RAT,
    starter: RAT_BASE + py`
    def to_dec_string(self, n):
        pass
`,
    forbid: ['float'],
    tests: [
      { expr: 'Rat(5, 4).to_dec_string(3)', expected: "'1.250'" },
      { expr: 'Rat(4, 3).to_dec_string(5)', expected: "'1.33333'" },
      { expr: 'Rat(20, 7).to_dec_string(6)', expected: "'2.857142'" },
      { expr: 'Rat(-1, 3).to_dec_string(2)', expected: "'-0.33'" },
      { expr: 'Rat(1, 100).to_dec_string(3)', expected: "'0.010'" },
      { expr: 'Rat(2).to_dec_string(2)', expected: "'2.00'" },
    ],
    solution: md`
'''python
${RAT_BASE}
    def to_dec_string(self, n):
        q = (10 ** n * abs(self.num)) // self.den   # tous les chiffres, sans virgule
        signe = "-" if self.num < 0 else ""
        entiere, decimales = divmod(q, 10 ** n)
        return f"{signe}{entiere}.{str(decimales).zfill(n)}"
'''
Pièges : le **signe**, à traiter sur $|a|$, sinon §//§ arrondit vers $-\infty$ ; et les **zéros en tête** de la partie décimale (§zfill§), comme dans $0.010$.
`,
  },
  {
    id: 'p3-somme-k4-rat',
    problem: 3,
    kind: 'code',
    title: 'Somme exacte de 1/k⁴ avec Rat',
    stars: 1,
    source: 'TP Pb3 A.2.2 Q5',
    tags: ['rationnels'],
    statement: md`
La classe §Rat§ est fournie. Écrire §somme_k4(n)§, qui renvoie $\displaystyle\sum_{k=1}^n \frac{1}{k^4}$ sous forme de §Rat§ (calcul exact).

'''
>>> somme_k4(2)
Rat(17, 16)
'''
`,
    setup: RAT_SETUP,
    starter: py`
def somme_k4(n):
    pass
`,
    forbid: ['float'],
    tests: [
      { expr: 'somme_k4(1)', expected: 'Rat(1, 1)', mode: 'repr' },
      { expr: 'somme_k4(2)', expected: 'Rat(17, 16)', mode: 'repr' },
      { expr: 'somme_k4(3)', expected: 'Rat(1393, 1296)', mode: 'repr' },
    ],
    solution: md`
'''python
def somme_k4(n):
    s = Rat(0)
    for k in range(1, n + 1):
        s = s + Rat(1, k ** 4)
    return s
'''
Le résultat est exact, mais les numérateurs et dénominateurs grossissent très vite : c'est beaucoup plus lent qu'avec des floats.
`,
  },
  {
    id: 'p3-somme-inverse',
    problem: 3,
    kind: 'code',
    title: 'Somme de 1/k⁴ en ordre inverse (absorption)',
    stars: 2,
    source: 'TP Pb3 A.1 Q4',
    tags: ['float', 'absorption'],
    statement: md`
Écrire §somme_inverse(n)§, qui calcule en §float§ $\displaystyle\sum_{k=1}^n \frac{1}{k^4}$ en additionnant **du plus petit terme au plus grand** ($k$ de $n$ à $1$), pour limiter les erreurs d'arrondi.
`,
    reminder: md`
**Absorption** : si $|y|$ est plus petit que l'écart entre deux floats voisins de $x$ (environ $x \times 1.1\cdot10^{-16}$), alors §x + y == x§. En sommant d'abord les petits termes, ils ont le temps de s'accumuler avant d'être ajoutés aux grands.
`,
    starter: py`
def somme_inverse(n):
    pass
`,
    tests: [
      { expr: 'somme_inverse(1)', expected: '1.0', mode: 'approx' },
      { expr: 'somme_inverse(2)', expected: '1.0625', mode: 'approx' },
      {
        label: 'ordre inverse respecté (n = 100000)',
        script: py`
n = 100000
s = 0.0
for k in range(n, 0, -1):
    s += 1 / k**4
got = somme_inverse(n)
expected = s
ok = abs(got - s) < 1e-15`,
      },
    ],
    solution: md`
'''python
def somme_inverse(n):
    s = 0.0
    for k in range(n, 0, -1):
        s += 1 / k ** 4
    return s
'''
En ordre croissant ($k = 1 \to n$), dès $k \approx 10^4$ on a $1/k^4 \approx 10^{-16}$, trop petit pour modifier $s \approx 1.08$ : les résultats pour $n = 10^4$ et $n = 10^5$ sont identiques.
`,
  },
  {
    id: 'p3-mat-inversible',
    problem: 3,
    kind: 'code',
    title: 'mat_inversible avec tolérance',
    stars: 2,
    source: 'TP Pb3 A.1 Q3',
    tags: ['float'],
    statement: md`
La fonction suivante se trompe pour $\begin{pmatrix} 0.3 & 1 \\ 0.9 & 3 \end{pmatrix}$ :
'''python
def mat_inversible(M):
    a, b = M[0]
    c, d = M[1]
    return a*d - b*c != 0
'''
Écrire une version corrigée §mat_inversible(M, eps=1e-12)§, qui considère le déterminant nul lorsque $|\det| \le$ §eps§.
`,
    reminder: md`$0.3$ et $0.9$ ne sont pas représentables exactement en binaire : §0.3*3 - 1*0.9§ donne environ $-1.1\cdot 10^{-16}$ au lieu de $0$. On ne teste **jamais** l'égalité exacte entre floats issus de calculs.`,
    starter: py`
def mat_inversible(M, eps=1e-12):
    pass
`,
    tests: [
      { expr: 'mat_inversible([[0.3, 1], [0.9, 3]])', expected: 'False' },
      { expr: 'mat_inversible([[1, 2], [3, 4]])', expected: 'True' },
      { expr: 'mat_inversible([[1, 2], [2, 4]])', expected: 'False' },
      { expr: 'mat_inversible([[0.1, 0.2], [0.3, 0.6]])', expected: 'False' },
    ],
    solution: md`
'''python
def mat_inversible(M, eps=1e-12):
    a, b = M[0]
    c, d = M[1]
    return abs(a * d - b * c) > eps
'''
`,
  },
  {
    id: 'p3-rang-approx-e',
    problem: 3,
    kind: 'code',
    title: 'rang_approx_e(delta) sans factorial',
    stars: 3,
    source: 'TP Pb3 B.1.2',
    tags: ['factorielle', 'approximation'],
    statement: md`
L'approximation $e \approx \sum_{k=0}^n \frac{1}{k!}$ commet une erreur $\le \frac{3}{(n+1)!}$.

Écrire §rang_approx_e(delta)§, qui renvoie le **plus petit** $n$ tel que $\dfrac{3}{(n+1)!} < \delta$, **sans** §factorial§.

'''
>>> rang_approx_e(1e-3)
6
'''
`,
    reminder: RAPPEL_FACT,
    starter: py`
def rang_approx_e(delta):
    pass
`,
    forbid: ['factorial'],
    tests: [
      { expr: 'rang_approx_e(1e-3)', expected: '6' },
      { expr: 'rang_approx_e(2)', expected: '1' },
      { expr: 'rang_approx_e(10)', expected: '0' },
      { expr: 'rang_approx_e(1e-16)', expected: '18' },
      { expr: 'rang_approx_e(10 ** -101)', expected: '70' },
    ],
    solution: md`
'''python
def rang_approx_e(delta):
    n = 0
    fact = 1                 # (n+1)! pour n = 0
    while 3 / fact >= delta:
        n += 1
        fact *= n + 1        # (n+1)! = n! * (n+1)
    return n
'''
Pour $\delta = 10^{-3}$ : $3/6! = 0.0042 \ge 10^{-3}$ mais $3/7! \approx 0.0006 < 10^{-3}$, d'où $n = 6$.
`,
  },
  {
    id: 'p3-approx-e-float',
    problem: 3,
    kind: 'code',
    title: 'approx_e(n) en float',
    stars: 3,
    source: 'TP Pb3 B.1.3',
    tags: ['factorielle'],
    statement: md`
Écrire §approx_e(n)§, qui renvoie (en §float§) $\displaystyle\sum_{k=0}^n \frac{1}{k!}$, efficacement et **sans** §factorial§.

'''
>>> approx_e(0)
1.0
>>> approx_e(3)
2.6666666666666665
'''
`,
    reminder: RAPPEL_FACT,
    starter: py`
def approx_e(n):
    pass
`,
    forbid: ['factorial'],
    tests: [
      { expr: 'approx_e(0)', expected: '1.0', mode: 'approx' },
      { expr: 'approx_e(1)', expected: '2.0', mode: 'approx' },
      { expr: 'approx_e(3)', expected: '8 / 3', mode: 'approx' },
      { expr: 'approx_e(20)', expected: '2.718281828459045', mode: 'approx', tol: 1e-14 },
    ],
    solution: md`
'''python
def approx_e(n):
    s = 1.0          # terme k = 0
    terme = 1.0
    for k in range(1, n + 1):
        terme = terme / k    # 1/k! = (1/(k-1)!) / k
        s += terme
    return s
'''
`,
  },
  {
    id: 'p3-approx-e-rat',
    problem: 3,
    kind: 'code',
    title: 'approx_e(n) avec Rat',
    stars: 3,
    source: 'TP Pb3 B.1.3',
    tags: ['factorielle', 'rationnels'],
    statement: md`
La classe §Rat§ est fournie. Écrire §approx_e(n)§, qui renvoie $\displaystyle\sum_{k=0}^n \frac{1}{k!}$ sous forme de §Rat§, en calculant les factorielles de manière incrémentale.

'''
>>> approx_e(3)
Rat(8, 3)
'''
`,
    reminder: RAPPEL_FACT,
    setup: RAT_SETUP,
    starter: py`
def approx_e(n):
    pass
`,
    forbid: ['factorial', 'float'],
    tests: [
      { expr: 'approx_e(0)', expected: 'Rat(1, 1)', mode: 'repr' },
      { expr: 'approx_e(1)', expected: 'Rat(2, 1)', mode: 'repr' },
      { expr: 'approx_e(3)', expected: 'Rat(8, 3)', mode: 'repr' },
      { expr: 'approx_e(5)', expected: 'Rat(163, 60)', mode: 'repr' },
    ],
    solution: md`
'''python
def approx_e(n):
    s = Rat(1)
    fact = 1
    for k in range(1, n + 1):
        fact = fact * k
        s = s + Rat(1, fact)
    return s
'''
$1 + 1 + \frac12 + \frac16 = \frac{16}{6} = \frac83$.
`,
  },
  {
    id: 'p3-rang-arctan',
    problem: 3,
    kind: 'code',
    title: 'rang_approx_arctan(x, delta)',
    stars: 2,
    source: 'TP Pb3 B.3.1',
    tags: ['approximation', 'arctan'],
    statement: md`
Écrire §rang_approx_arctan(x, delta)§, qui renvoie le plus petit $n$ tel que $\dfrac{x^{2n+1}}{2n+1} < \delta$ (avec $x \in ]0, 1]$).

'''
>>> rang_approx_arctan(1, 1e-4)
5000
>>> rang_approx_arctan(0.2, 1e-4)
2
'''
`,
    reminder: RAPPEL_ARCTAN,
    starter: py`
def rang_approx_arctan(x, delta):
    pass
`,
    tests: [
      { expr: 'rang_approx_arctan(1, 1e-4)', expected: '5000' },
      { expr: 'rang_approx_arctan(0.2, 1e-4)', expected: '2' },
      { expr: 'rang_approx_arctan(1, 0.5)', expected: '1' },
      { expr: 'rang_approx_arctan(1/239, 1e-20)', expected: '4' },
    ],
    solution: md`
'''python
def rang_approx_arctan(x, delta):
    n = 0
    while x ** (2 * n + 1) / (2 * n + 1) >= delta:
        n += 1
    return n
'''
Pour $x = 1$ : $\frac{1}{2n+1} < 10^{-4} \iff 2n + 1 > 10^4 \iff n \ge 5000$. Pour $x = \frac15$, deux termes suffisent : la convergence est bien plus rapide quand $x$ est petit.
`,
  },
  {
    id: 'p3-approx-arctan',
    problem: 3,
    kind: 'code',
    title: 'approx_arctan(x, n) en float',
    stars: 3,
    source: 'TP Pb3 B.3.1',
    tags: ['arctan', 'efficacité'],
    statement: md`
Écrire §approx_arctan(x, n)§, qui renvoie $\displaystyle\sum_{k=0}^{n-1} (-1)^k \frac{x^{2k+1}}{2k+1}$ en recyclant les puissances de $x$ (pas de §**§ ni de §pow§).

'''
>>> approx_arctan(1, 2)
0.6666666666666667
'''
`,
    reminder: RAPPEL_ARCTAN,
    starter: py`
def approx_arctan(x, n):
    pass
`,
    forbid: ['**', 'pow', 'atan'],
    tests: [
      { expr: 'approx_arctan(1, 1)', expected: '1', mode: 'approx' },
      { expr: 'approx_arctan(1, 2)', expected: '1 - 1/3', mode: 'approx' },
      { expr: 'approx_arctan(0.5, 0)', expected: '0', mode: 'approx' },
      { expr: 'approx_arctan(0.2, 10)', expected: '0.19739555984988078', mode: 'approx', tol: 1e-13 },
      { expr: 'approx_arctan(1/239, 5)', expected: '0.004184076002074726', mode: 'approx', tol: 1e-13 },
    ],
    solution: md`
'''python
def approx_arctan(x, n):
    s = 0
    puissance = x          # x^(2k+1) pour k = 0
    x2 = x * x
    signe = 1
    for k in range(n):
        s += signe * puissance / (2 * k + 1)
        puissance *= x2    # x^(2k+1) -> x^(2k+3)
        signe = -signe
    return s
'''
`,
  },
  {
    id: 'p3-approx-arctan-rat',
    problem: 3,
    kind: 'code',
    title: 'approx_arctan avec Rat',
    stars: 2,
    source: 'TP Pb3 B.3.1',
    tags: ['arctan', 'rationnels'],
    statement: md`
Même somme $\sum_{k=0}^{n-1} (-1)^k \frac{x^{2k+1}}{2k+1}$, mais §x§ est un §Rat§ et le résultat aussi (classe fournie avec §+ - * / -x§).

'''
>>> approx_arctan(Rat(1, 5), 2)
Rat(74, 375)
'''
`,
    reminder: RAPPEL_ARCTAN,
    setup: RAT_SETUP,
    starter: py`
def approx_arctan(x, n):
    pass
`,
    forbid: ['float'],
    tests: [
      { expr: 'approx_arctan(Rat(1, 5), 1)', expected: 'Rat(1, 5)', mode: 'repr' },
      { expr: 'approx_arctan(Rat(1, 5), 2)', expected: 'Rat(74, 375)', mode: 'repr' },
      { expr: 'approx_arctan(Rat(1), 3)', expected: 'Rat(13, 15)', mode: 'repr' },
      { expr: 'approx_arctan(Rat(1), 0)', expected: 'Rat(0, 1)', mode: 'repr' },
    ],
    solution: md`
'''python
def approx_arctan(x, n):
    s = Rat(0)
    puissance = x
    x2 = x * x
    for k in range(n):
        terme = puissance * Rat(1, 2 * k + 1)
        if k % 2 == 0:
            s = s + terme
        else:
            s = s - terme
        puissance = puissance * x2
    return s
'''
$\frac15 - \frac{1}{375} = \frac{75 - 1}{375} = \frac{74}{375}$.
`,
  },
  {
    id: 'p3-leibniz',
    problem: 3,
    kind: 'code',
    title: 'π par la formule de Leibniz',
    stars: 2,
    source: 'TP Pb3 B.3.2',
    tags: ['pi', 'arctan'],
    statement: md`
Puisque $\arctan(1) = \frac\pi4$, écrire §approx_pi_leibniz(n)§, qui renvoie (en float) $4\sum_{k=0}^{n-1} \frac{(-1)^k}{2k+1}$.

'''
>>> approx_pi_leibniz(1)
4.0
>>> approx_pi_leibniz(2)
2.666666666666667
'''
`,
    reminder: RAPPEL_ARCTAN,
    starter: py`
def approx_pi_leibniz(n):
    pass
`,
    tests: [
      { expr: 'approx_pi_leibniz(1)', expected: '4.0', mode: 'approx' },
      { expr: 'approx_pi_leibniz(2)', expected: '4 - 4/3', mode: 'approx' },
      { expr: 'abs(approx_pi_leibniz(20000) - math.pi) < 4 / 40001', expected: 'True' },
    ],
    setup: py`import math`,
    solution: md`
'''python
def approx_pi_leibniz(n):
    s = 0
    signe = 1
    for k in range(n):
        s += signe / (2 * k + 1)
        signe = -signe
    return 4 * s
'''
Erreur $\le \frac{4}{2n+1}$ : pour $d$ décimales, il faut $n \approx 2 \cdot 10^{d+1}$ termes. C'est **exponentiel** en $d$, donc très lent.
`,
  },
  {
    id: 'p3-machin',
    problem: 3,
    kind: 'code',
    title: 'π par la formule de Machin',
    stars: 1,
    source: 'TP Pb3 B.3.3',
    tags: ['pi', 'arctan'],
    statement: md`
Avec la formule de Machin $\dfrac\pi4 = 4\arctan\dfrac15 - \arctan\dfrac1{239}$ et la fonction §approx_arctan(x, n)§ fournie (float), écrire §approx_pi_machin(n1, n2)§, qui utilise $n_1$ termes pour $\arctan\frac15$ et $n_2$ pour $\arctan\frac1{239}$.
`,
    reminder: RAPPEL_ARCTAN,
    setup: ARCTAN_SETUP,
    starter: py`
def approx_pi_machin(n1, n2):
    pass
`,
    tests: [
      { expr: 'approx_pi_machin(10, 3)', expected: '3.141592653589793', mode: 'approx', tol: 1e-14 },
      { expr: 'approx_pi_machin(1, 1)', expected: '16/5 - 4/239', mode: 'approx' },
    ],
    solution: md`
'''python
def approx_pi_machin(n1, n2):
    return 16 * approx_arctan(1/5, n1) - 4 * approx_arctan(1/239, n2)
'''
$\pi = 4\left(4\arctan\frac15 - \arctan\frac1{239}\right)$. Les séries convergent vite ($x$ petit) : chaque terme en $\frac15$ apporte environ 1,4 décimale.
`,
  },
  {
    id: 'p3-ceilsqrt',
    problem: 3,
    kind: 'code',
    title: 'ceilsqrt(x) sans sqrt',
    stars: 3,
    source: 'TP Pb3 C.1',
    tags: ['newton'],
    statement: md`
Écrire §ceilsqrt(x)§ ($x \ge 0$), qui renvoie le plus petit entier naturel $n$ tel que $n^2 \ge x$, sans §sqrt§.

'''
>>> ceilsqrt(16)
4
>>> ceilsqrt(17)
5
>>> ceilsqrt(2.5)
2
'''
`,
    starter: py`
def ceilsqrt(x):
    pass
`,
    forbid: ['sqrt', 'isqrt', 'pow', '**'],
    tests: [
      { expr: 'ceilsqrt(16)', expected: '4' },
      { expr: 'ceilsqrt(17)', expected: '5' },
      { expr: 'ceilsqrt(0)', expected: '0' },
      { expr: 'ceilsqrt(1)', expected: '1' },
      { expr: 'ceilsqrt(2.5)', expected: '2' },
      { expr: 'ceilsqrt(0.25)', expected: '1' },
    ],
    solution: md`
'''python
def ceilsqrt(x):
    n = 0
    while n * n < x:
        n += 1
    return n
'''
Coût en $O(\sqrt x)$ : ça suffit pour une estimation initiale de Newton.
`,
  },
  {
    id: 'p3-mysqrt',
    problem: 3,
    kind: 'code',
    title: 'mysqrt(x) par la méthode de Newton',
    stars: 3,
    source: 'TP Pb3 C.1',
    tags: ['newton'],
    statement: md`
Écrire §mysqrt(x)§ ($x \ge 0$), qui calcule $\sqrt x$ par Newton :
- valeur initiale §ceilsqrt(x)§ (à réécrire ou à intégrer) ;
- arrêt dès que $|x_{k+1} - x_k| < 2\cdot10^{-16}\,|x_{k+1}|$, ou après 100 itérations ;
- §mysqrt(0)§ renvoie §0.0§.

Interdit : §sqrt§, §**§, §pow§.
`,
    reminder: RAPPEL_NEWTON,
    starter: py`
def mysqrt(x):
    pass
`,
    forbid: ['sqrt', 'isqrt', 'pow', '**'],
    tests: [
      { expr: 'mysqrt(2)', expected: '1.4142135623730951', mode: 'approx', tol: 1e-15 },
      { expr: 'mysqrt(16)', expected: '4.0', mode: 'approx', tol: 1e-15 },
      { expr: 'mysqrt(10)', expected: '3.1622776601683795', mode: 'approx', tol: 1e-15 },
      { expr: 'mysqrt(1e6)', expected: '1000.0', mode: 'approx', tol: 1e-15 },
      { expr: 'mysqrt(0.25)', expected: '0.5', mode: 'approx', tol: 1e-15 },
      { expr: 'mysqrt(0)', expected: '0.0', mode: 'approx' },
    ],
    solution: md`
'''python
def ceilsqrt(x):
    n = 0
    while n * n < x:
        n += 1
    return n

def mysqrt(x):
    if x == 0:
        return 0.0
    xk = float(ceilsqrt(x))
    for _ in range(100):
        suivant = (xk + x / xk) / 2
        if abs(suivant - xk) < 2e-16 * abs(suivant):
            return suivant
        xk = suivant
    return xk
'''
Partir de §ceilsqrt(x)§ $\ge \sqrt x$ garantit une suite décroissante vers $\sqrt x$.
`,
  },
  {
    id: 'p3-nthroot',
    problem: 3,
    kind: 'code',
    title: 'nthroot(a, n) : racine n-ième par Newton',
    stars: 2,
    source: 'TP Pb3 C.2',
    tags: ['newton'],
    statement: md`
Écrire §nthroot(a, n)§ ($a \ge 0$, $n \ge 1$), qui calcule $\sqrt[n]a$ par la méthode de Newton appliquée à $f(x) = x^n - a$ (même critère d'arrêt que §mysqrt§). On partira de $x_0 = \max(1, a)$, qui est $\ge \sqrt[n]a$.

'''
>>> nthroot(27, 3)
3.0
'''
`,
    reminder: md`
Newton pour $f(x) = x^n - a$, avec $f'(x) = n x^{n-1}$ :
$$x_{k+1} = x_k - \frac{x_k^n - a}{n x_k^{n-1}} = \frac{(n-1)\,x_k + a / x_k^{n-1}}{n}$$
`,
    starter: py`
def nthroot(a, n):
    pass
`,
    forbid: ['pow'],
    tests: [
      { expr: 'nthroot(27, 3)', expected: '3', mode: 'approx', tol: 1e-14 },
      { expr: 'nthroot(2, 2)', expected: '2 ** 0.5', mode: 'approx', tol: 1e-14 },
      { expr: 'nthroot(1000, 3)', expected: '10', mode: 'approx', tol: 1e-14 },
      { expr: 'nthroot(5, 4)', expected: '5 ** 0.25', mode: 'approx', tol: 1e-14 },
      { expr: 'nthroot(0.5, 3)', expected: '0.5 ** (1/3)', mode: 'approx', tol: 1e-14 },
      { expr: 'nthroot(7, 1)', expected: '7', mode: 'approx', tol: 1e-14 },
    ],
    solution: md`
'''python
def nthroot(a, n):
    if a == 0:
        return 0.0
    xk = float(max(1, a))
    for _ in range(100):
        suivant = ((n - 1) * xk + a / xk ** (n - 1)) / n
        if abs(suivant - xk) < 2e-16 * abs(suivant):
            return suivant
        xk = suivant
    return xk
'''
Pour $n = 2$, on retrouve exactement la formule de §mysqrt§.
`,
  },
  {
    id: 'p3-newton',
    problem: 3,
    kind: 'code',
    title: 'Méthode de Newton générique',
    stars: 2,
    source: 'TP Pb3 C (généralisation)',
    tags: ['newton'],
    statement: md`
Écrire §newton(f, fp, x0, eps=1e-12, itmax=100)§, qui applique $x_{k+1} = x_k - f(x_k)/f'(x_k)$ à partir de §x0§ et s'arrête dès que $|x_{k+1} - x_k| < \varepsilon$ (ou après §itmax§ itérations). Elle renvoie la dernière valeur calculée.

'''
>>> newton(lambda x: x*x - 2, lambda x: 2*x, 1)
1.414213562373095
'''
`,
    reminder: RAPPEL_NEWTON,
    starter: py`
def newton(f, fp, x0, eps=1e-12, itmax=100):
    pass
`,
    setup: py`import math`,
    tests: [
      { expr: 'newton(lambda x: x*x - 2, lambda x: 2*x, 1)', expected: '2 ** 0.5', mode: 'approx', tol: 1e-12 },
      { expr: 'newton(lambda x: math.cos(x) - x, lambda x: -math.sin(x) - 1, 1)', expected: '0.7390851332151607', mode: 'approx', tol: 1e-12 },
      { expr: 'newton(lambda x: x**3 - 8, lambda x: 3*x*x, 5)', expected: '2', mode: 'approx', tol: 1e-12 },
    ],
    solution: md`
'''python
def newton(f, fp, x0, eps=1e-12, itmax=100):
    x = x0
    for _ in range(itmax):
        suivant = x - f(x) / fp(x)
        if abs(suivant - x) < eps:
            return suivant
        x = suivant
    return x
'''
`,
  },
  {
    id: 'p3-erreur-relative',
    problem: 3,
    kind: 'code',
    title: 'Erreur relative maximale de mysqrt',
    stars: 1,
    source: 'TP Pb3 C.1',
    tags: ['float'],
    statement: md`
§mysqrt§ est fournie. Écrire §erreur_max(valeurs)§, qui renvoie la plus grande **erreur relative** $\dfrac{|\text{mysqrt}(a) - \text{math.sqrt}(a)|}{|\text{math.sqrt}(a)|}$ sur la liste §valeurs§ (toutes $> 0$).
`,
    setup: MYSQRT_SETUP + py`
import math`,
    starter: py`
import math

def erreur_max(valeurs):
    pass
`,
    tests: [
      { expr: 'erreur_max([5, 10, 15, 100]) < 1e-15', expected: 'True' },
      {
        label: 'calcul correct',
        script: py`
vals = [2, 3, 5]
exp = max(abs(mysqrt(a) - math.sqrt(a)) / math.sqrt(a) for a in vals)
got = erreur_max(vals)
expected = exp
ok = got == exp`,
      },
    ],
    solution: md`
'''python
import math

def erreur_max(valeurs):
    m = 0
    for a in valeurs:
        ref = math.sqrt(a)
        err = abs(mysqrt(a) - ref) / abs(ref)
        if err > m:
            m = err
    return m
'''
`,
  },

  // ───────────────────────────── MATHS ─────────────────────────────
  {
    id: 'p3-m-15-decimales',
    problem: 3,
    kind: 'math',
    title: 'Pourquoi math.pi n’a que ~16 chiffres',
    stars: 2,
    source: 'TP Pb3 A.1 Q1',
    tags: ['float'],
    statement: md`
Pourquoi les constantes §math.e§ et §math.pi§ ne contiennent-elles qu'une quinzaine de décimales ?
`,
    answer: md`Un float (IEEE 754, 64 bits) a 53 bits de mantisse, soit environ $\log_{10}(2^{53}) \approx 16$ chiffres significatifs.`,
    solution: md`
Un §float§ est stocké au format IEEE 754 double précision : 1 bit de signe, 11 bits d'exposant et 52 bits de mantisse (53 avec le bit implicite). Il représente donc $\pm m \cdot 2^e$ avec $m$ sur 53 bits, soit environ $53 \log_{10} 2 \approx 15{,}95$ chiffres décimaux significatifs.

$\pi$ et $e$ sont irrationnels (développement infini) : on stocke le float le plus proche, et les chiffres au-delà n'existent pas en mémoire.
`,
  },
  {
    id: 'p3-m-025-02',
    problem: 3,
    kind: 'math',
    title: '0.25 exact, 0.2 non ; 0.1 + 0.2 ≠ 0.3',
    stars: 3,
    source: 'TP Pb3 A.1 Q2',
    tags: ['float'],
    statement: md`
1. Pourquoi $0.25$ est-il représenté exactement en §float§, mais pas $0.2$ ?
2. Pourquoi §0.1 + 0.2 == 0.3§ vaut-il §False§ ? Comment tester correctement l'égalité ?
`,
    answer: md`Seuls les $k/2^n$ ont un développement binaire fini : $0.25 = 2^{-2}$, mais $0.2 = 1/5$ est infini en base 2 ; on teste §abs(x - y) < eps§ ou §math.isclose§.`,
    solution: md`
1. Un float représente exactement les nombres $\frac{k}{2^n}$ (développement binaire fini, de taille limitée). $0.25 = \frac14 = 2^{-2} = (0.01)_2$ est exact. $0.2 = \frac15$ a un développement binaire **infini périodique** $(0.00110011\ldots)_2$, car 5 ne divise aucune puissance de 2 : on stocke une valeur arrondie.
2. $0.1$, $0.2$ et $0.3$ sont tous arrondis, et la somme des arrondis ne tombe pas sur l'arrondi de $0.3$ : §0.1 + 0.2§ donne §0.30000000000000004§. On compare donc avec une tolérance : §abs(x - y) < 1e-12§ ou §math.isclose(x, y)§.
`,
  },
  {
    id: 'p3-m-mat',
    problem: 3,
    kind: 'math',
    title: 'Déterminant flottant faux',
    stars: 2,
    source: 'TP Pb3 A.1 Q3',
    tags: ['float'],
    statement: md`
Pourquoi le test §a*d - b*c != 0§ dit-il que $\begin{pmatrix} 0.3 & 1 \\ 0.9 & 3 \end{pmatrix}$ est inversible ?
`,
    answer: md`$\det = 0$ en théorie, mais $0.3$ et $0.9$ sont arrondis : on obtient $\approx -1.1\cdot10^{-16} \ne 0$.`,
    solution: md`
Mathématiquement, $\det = 0.3 \times 3 - 1 \times 0.9 = 0$ : la matrice n'est pas inversible. Mais $0.3$ et $0.9$ ne sont pas représentables exactement en binaire, et le calcul flottant donne environ $-1.1 \cdot 10^{-16}$. Le test §!= 0§ conclut donc à tort que la matrice est inversible. Il faut une tolérance : §abs(det) > eps§.
`,
  },
  {
    id: 'p3-m-absorption',
    problem: 3,
    kind: 'math',
    title: 'Somme de 1/k⁴ qui stagne',
    stars: 2,
    source: 'TP Pb3 A.1 Q4',
    tags: ['float', 'absorption'],
    statement: md`
On calcule $\sum_{k=1}^n \frac{1}{k^4}$ en float, avec $k$ croissant. Pourquoi obtient-on le même résultat pour $n = 10\,000$ et $n = 100\,000$ ? Comment y remédier ?
`,
    answer: md`Absorption : pour $k \gtrsim 10^4$, $1/k^4 \lesssim 10^{-16}$ est plus petit que la précision autour de $s \approx 1.08$, donc §s + terme == s§. Remède : sommer de $k = n$ à $1$.`,
    solution: md`
La somme partielle vaut environ $1.08$. L'écart entre deux floats voisins de $1.08$ est d'environ $2.2 \cdot 10^{-16}$. Dès que $\frac{1}{k^4}$ est nettement plus petit (pour $k \approx 10^4$, $\frac1{k^4} = 10^{-16}$), l'addition est **absorbée** et §s + 1/k**4 == s§ : la somme ne bouge plus.

Remède : additionner **du plus petit au plus grand** ($k$ de $n$ à $1$). Les petits termes s'accumulent entre eux avant d'être ajoutés aux grands. (En ordre croissant, les résultats sont bons jusqu'à $n \approx 10^3$.)
`,
  },
  {
    id: 'p3-m-irreductible',
    problem: 3,
    kind: 'math',
    title: 'Fractions irréductibles',
    stars: 3,
    source: 'TP Pb3 A.2.1 Q1',
    tags: ['arithmétique', 'calcul'],
    statement: md`
Déterminer le représentant irréductible (dénominateur $> 0$) de $\dfrac{308}{196}$, $\dfrac{110}{-132}$ et $\dfrac{-84}{-36}$.
`,
    reminder: RAPPEL_RAT,
    answer: md`$\frac{11}{7}$, $-\frac{5}{6}$, $\frac{7}{3}$`,
    solution: md`
- $\mathrm{pgcd}(308, 196) = 28$ (Euclide : $308 = 196 + 112$, $196 = 112 + 84$, $112 = 84 + 28$, $84 = 3 \cdot 28$), d'où $\frac{308}{196} = \frac{11}{7}$.
- $\mathrm{pgcd}(110, 132) = 22$ : $\frac{110}{-132} = \frac{5}{-6} = \frac{-5}{6}$ (signe au numérateur).
- $\mathrm{pgcd}(84, 36) = 12$ : $\frac{-84}{-36} = \frac{-7}{-3} = \frac73$.
`,
  },
  {
    id: 'p3-m-procedure',
    problem: 3,
    kind: 'math',
    title: 'Procédure de réduction',
    stars: 2,
    source: 'TP Pb3 A.2.1 Q2',
    tags: ['arithmétique'],
    statement: md`
Décrire la procédure permettant d'obtenir le représentant irréductible de $\frac ab$ ($b \ne 0$). Par quoi divise-t-on, et comment traite-t-on le signe ?
`,
    answer: md`On divise $a$ et $b$ par $g = \mathrm{pgcd}(|a|, |b|)$, puis, si $b < 0$, on change le signe des deux.`,
    solution: md`
1. Calculer $g = \mathrm{pgcd}(|a|, |b|)$ (Euclide), avec $g \ge 1$ car $b \ne 0$.
2. Diviser : $p = a / g$, $q = b / g$ (divisions **entières** exactes).
3. Si $q < 0$, remplacer $(p, q)$ par $(-p, -q)$.

On obtient $\frac pq$ avec $q > 0$ et $\mathrm{pgcd}(p, q) = 1$. En Python, on peut fusionner les étapes 2 et 3 en divisant par $-g$ quand $b < 0$.
`,
  },
  {
    id: 'p3-m-gauss',
    problem: 3,
    kind: 'math',
    title: 'Unicité du représentant irréductible (Gauss)',
    stars: 1,
    source: 'TP Pb3 A.2.1 Q3',
    tags: ['preuve', 'arithmétique'],
    statement: md`
**Lemme de Gauss** : si $a \mid bc$ et $\mathrm{pgcd}(a, b) = 1$, alors $a \mid c$.

Soit $\frac ab = \frac cd$ deux représentants irréductibles ($b, d > 0$). Montrer que $b \mid d$ et $d \mid b$, puis conclure que $a = c$ et $b = d$.
`,
    answer: md`$ad = bc$ ; $b \mid ad$ et $\mathrm{pgcd}(b, a) = 1$ donnent $b \mid d$ ; de même $d \mid b$ ; donc $b = d$ (positifs), puis $a = c$.`,
    solution: md`
$\frac ab = \frac cd \Rightarrow ad = bc$.
- $b$ divise $bc = ad$, et $\mathrm{pgcd}(b, a) = 1$, donc par Gauss $b \mid d$.
- $d$ divise $ad = bc$, et $\mathrm{pgcd}(d, c) = 1$, donc $d \mid b$.

$b \mid d$, $d \mid b$ et $b, d > 0$ donnent $b = d$. Alors $ab = cb$ avec $b \ne 0$, donc $a = c$.
`,
  },
  {
    id: 'p3-m-operations',
    problem: 3,
    kind: 'math',
    title: 'Opérations sur les fractions',
    stars: 3,
    source: 'TP Pb3 A.2.2 Q2',
    tags: ['rationnels'],
    statement: md`
Soit $x = \frac ab$ et $y = \frac cd$. Écrire $x + y$, $x - y$, $xy$ et $x / y$ sous la forme $\frac pq$. Application : calculer $\frac12 + \frac54$ et $\left(\frac32 \cdot \frac57 - 1\right) / \frac34$.
`,
    answer: md`$\frac{ad+bc}{bd}$, $\frac{ad-bc}{bd}$, $\frac{ac}{bd}$, $\frac{ad}{bc}$ ; $\frac74$ et $\frac2{21}$.`,
    solution: md`
$$x + y = \frac{ad + bc}{bd}, \quad x - y = \frac{ad - bc}{bd}, \quad xy = \frac{ac}{bd}, \quad \frac xy = \frac{ad}{bc}\ (c \ne 0)$$

- $\frac12 + \frac54 = \frac{4 + 10}{8} = \frac{14}{8} = \frac74$
- $\frac32 \cdot \frac57 = \frac{15}{14}$ ; $\frac{15}{14} - 1 = \frac1{14}$ ; $\frac{1/14}{3/4} = \frac{4}{42} = \frac{2}{21}$
`,
  },
  {
    id: 'p3-m-comparaison',
    problem: 3,
    kind: 'math',
    title: 'Comparer deux fractions sans division',
    stars: 2,
    source: 'TP Pb3 A.2.2 Q3',
    tags: ['rationnels'],
    statement: md`
Avec $b, d > 0$, à quelle condition sur $a, b, c, d$ a-t-on $\frac ab < \frac cd$ ? Et $\frac ab \le \frac cd$ ? Pourquoi éviter la division ? Que se passe-t-il si l'on oublie l'hypothèse $b, d > 0$ ?
`,
    answer: md`$ad < bc$ (resp. $\le$) ; la division donne un float arrondi ; si un dénominateur est négatif, l'inégalité s'inverse.`,
    solution: md`
En multipliant par $bd > 0$, on ne change pas le sens de l'inégalité : $\frac ab < \frac cd \iff ad < bc$, et de même avec $\le$.

La division §a / b§ produit un float, sujet aux erreurs d'arrondi, alors que le produit en croix reste exact sur les entiers. Si $bd < 0$, l'inégalité s'inverserait : d'où l'importance de l'invariant « dénominateur $> 0$ » dans §Rat§. Exemple : $\frac{1}{-2} < \frac13$, mais $1 \cdot 3 < (-2) \cdot 1$ est faux.
`,
  },
  {
    id: 'p3-m-taylor',
    problem: 3,
    kind: 'math',
    title: 'Taylor-Lagrange pour e',
    stars: 2,
    source: 'TP Pb3 B.1.1',
    tags: ['analyse'],
    statement: md`
Rappel : $f(x) = \sum_{k=0}^n \frac{f^{(k)}(a)}{k!}(x - a)^k + \frac{f^{(n+1)}(c)}{(n+1)!}(x - a)^{n+1}$ avec $c$ entre $a$ et $x$.

1. Écrire cette formule pour $f = \exp$, $a = 0$, $x = 1$.
2. En déduire que $\left| e - \sum_{k=0}^n \frac1{k!} \right| \le \frac{e}{(n+1)!} \le \frac{3}{(n+1)!}$.
`,
    answer: md`$e = \sum_{k=0}^n \frac{1}{k!} + \frac{e^c}{(n+1)!}$ avec $c \in ]0, 1[$ ; $e^c \le e < 3$.`,
    solution: md`
1. Toutes les dérivées de $\exp$ valent $\exp$, et $\exp(0) = 1$ :
$$e = 1 + 1 + \frac1{2!} + \dots + \frac1{n!} + \frac{e^c}{(n+1)!}, \quad c \in ]0, 1[.$$
2. L'erreur vaut $\frac{e^c}{(n+1)!} > 0$. Comme $\exp$ est croissante et $c < 1$, on a $e^c \le e$, et $e < 3$ :
$$0 \le e - \sum_{k=0}^n \frac{1}{k!} \le \frac{e}{(n+1)!} \le \frac{3}{(n+1)!}.$$
`,
  },
  {
    id: 'p3-m-cout-e',
    problem: 3,
    kind: 'math',
    title: "Coût du calcul de approx_e et nombre de termes",
    stars: 2,
    source: 'TP Pb3 B.1 (style « valeur exacte »)',
    tags: ['complexité'],
    statement: md`
1. Combien de multiplications (pour les factorielles) et d'additions fait §approx_e(n)§ avec la factorielle incrémentale ? Et si l'on recalcule $k!$ de zéro à chaque terme (boucle de $2$ à $k$) ?
2. Quel $n$ faut-il pour garantir 3 décimales correctes (erreur $< 10^{-4}$) ?
`,
    answer: md`1. $n$ multiplications et $n$ additions, contre $\sum_{k=2}^n (k-1) = \frac{n(n-1)}{2}$ multiplications. 2. $3/(n+1)! < 10^{-4}$ donne $n = 7$.`,
    solution: md`
1. Incrémental : une multiplication §fact *= k§ et une addition par $k = 1..n$, soit $n$ de chaque. Naïf : $k!$ coûte $k - 1$ multiplications, d'où $\sum_{k=1}^n (k-1) = \frac{n(n-1)}{2}$ (quadratique).
2. On veut $(n+1)! > 3 \cdot 10^4 = 30\,000$ : $7! = 5040$ ne suffit pas, $8! = 40\,320$ suffit, donc $n + 1 = 8$ et $n = 7$.
`,
  },
  {
    id: 'p3-m-arctan',
    problem: 3,
    kind: 'math',
    title: 'Définition de arctan, arctan(1) = π/4',
    stars: 2,
    source: 'TP Pb3 B.3.1',
    tags: ['trigonométrie'],
    statement: md`
Rappeler la définition de $\arctan$, puis montrer que $\arctan(1) = \frac\pi4$.
`,
    answer: md`$\arctan : \mathbb{R} \to ]-\frac\pi2, \frac\pi2[$ est la réciproque de $\tan$ restreinte à cet intervalle ; $\tan\frac\pi4 = 1$ et $\frac\pi4 \in ]-\frac\pi2, \frac\pi2[$.`,
    solution: md`
$\tan$ est une bijection (continue, strictement croissante) de $]-\frac\pi2, \frac\pi2[$ sur $\mathbb{R}$ ; $\arctan$ est sa réciproque : pour $x \in \mathbb{R}$, $\arctan x$ est l'**unique** $\theta \in ]-\frac\pi2, \frac\pi2[$ tel que $\tan\theta = x$.

Comme $\tan\frac\pi4 = \frac{\sin(\pi/4)}{\cos(\pi/4)} = 1$ et $\frac\pi4 \in ]-\frac\pi2, \frac\pi2[$, on a $\arctan 1 = \frac\pi4$.
`,
  },
  {
    id: 'p3-m-rang-arctan',
    problem: 3,
    kind: 'math',
    title: 'Rang pour 3 décimales de arctan(1) et arctan(1/5)',
    stars: 2,
    source: 'TP Pb3 B.3.1',
    tags: ['approximation'],
    statement: md`
L'erreur de $\sum_{k=0}^{n-1} (-1)^k \frac{x^{2k+1}}{2k+1}$ est $\le \frac{x^{2n+1}}{2n+1}$. Pour 3 décimales correctes, on veut une erreur $< 10^{-4}$. Quel $n$ faut-il pour $x = 1$ ? Et pour $x = \frac15$ ?
`,
    answer: md`$x = 1$ : $n = 5000$. $x = \frac15$ : $n = 2$.`,
    solution: md`
- $x = 1$ : $\frac{1}{2n+1} < 10^{-4} \iff 2n + 1 > 10^4 \iff n > 4999.5$, donc $n = 5000$.
- $x = \frac15$ : $n = 1$ donne $\frac{(1/5)^3}{3} = \frac{1}{375} \approx 2.7\cdot10^{-3}$, trop grand ; $n = 2$ donne $\frac{(1/5)^5}{5} = \frac{1}{15625} = 6.4\cdot10^{-5} < 10^{-4}$. Donc $n = 2$.
`,
  },
  {
    id: 'p3-m-leibniz',
    problem: 3,
    kind: 'math',
    title: 'Erreur de Leibniz et nombre de termes',
    stars: 2,
    source: 'TP Pb3 B.3.2',
    tags: ['pi', 'approximation'],
    statement: md`
On approche $\pi$ par $4 \sum_{k=0}^{n-1} \frac{(-1)^k}{2k+1}$.
1. Quelle est l'erreur maximale ?
2. Quel $n$ faut-il pour $d$ décimales (erreur $< 10^{-(d+1)}$) ? Commenter.
`,
    answer: md`$\frac{4}{2n+1}$ ; $n = 2 \cdot 10^{d+1}$ : exponentiel en $d$, donc inutilisable au-delà de quelques décimales.`,
    solution: md`
1. $\left|\frac\pi4 - S_n\right| \le \frac{1}{2n+1}$, donc $|\pi - 4S_n| \le \frac{4}{2n+1}$.
2. $\frac{4}{2n+1} < 10^{-(d+1)} \iff 2n + 1 > 4 \cdot 10^{d+1} \iff n > 2 \cdot 10^{d+1} - \frac12$, donc $n = 2 \cdot 10^{d+1}$.

Chaque décimale supplémentaire multiplie le nombre de termes par 10 : la convergence est **très lente**.
`,
  },
  {
    id: 'p3-m-tan2a',
    problem: 3,
    kind: 'math',
    title: 'tan(2 arctan(1/5))',
    stars: 2,
    source: 'TP Pb3 B.3.3',
    tags: ['trigonométrie', 'calcul'],
    statement: md`
À l'aide de $\tan(x + y) = \dfrac{\tan x + \tan y}{1 - \tan x \tan y}$, calculer $A = \tan\!\left(2\arctan\frac15\right)$ sous forme de fraction.
`,
    reminder: md`Avec $y = x$ : $\tan 2x = \dfrac{2\tan x}{1 - \tan^2 x}$, et $\tan(\arctan t) = t$.`,
    answer: md`$A = \dfrac{2/5}{1 - 1/25} = \dfrac{5}{12}$`,
    solution: md`
Avec $t = \tan(\arctan\frac15) = \frac15$ :
$$A = \frac{2t}{1 - t^2} = \frac{2/5}{24/25} = \frac25 \cdot \frac{25}{24} = \frac{5}{12}.$$
`,
  },
  {
    id: 'p3-m-machin',
    problem: 3,
    kind: 'math',
    title: 'Formule de Machin',
    stars: 1,
    source: 'TP Pb3 B.3.3',
    tags: ['trigonométrie', 'preuve'],
    statement: md`
Sachant que $A = \tan(2\arctan\frac15) = \frac5{12}$ :
1. Calculer $B = \tan(4\arctan\frac15)$.
2. Calculer $C = \tan\left(4\arctan\frac15 - \frac\pi4\right)$.
3. En déduire $\frac\pi4 = 4\arctan\frac15 - \arctan\frac1{239}$.
`,
    reminder: md`$\tan(x - y) = \dfrac{\tan x - \tan y}{1 + \tan x \tan y}$, $\tan\frac\pi4 = 1$.`,
    answer: md`$B = \frac{120}{119}$, $C = \frac{1}{239}$ ; l'angle est dans $]-\frac\pi2, \frac\pi2[$, donc il vaut $\arctan\frac1{239}$.`,
    solution: md`
1. $B = \dfrac{2A}{1 - A^2} = \dfrac{10/12}{1 - 25/144} = \dfrac{5/6}{119/144} = \dfrac{120}{119}$.
2. $C = \dfrac{B - 1}{1 + B} = \dfrac{1/119}{239/119} = \dfrac{1}{239}$.
3. Pour $x > 0$, $\arctan x < x$, donc $0 < 4\arctan\frac15 < \frac45 < \frac\pi2$, et l'angle $4\arctan\frac15 - \frac\pi4$ est dans $]-\frac\pi4, \frac\pi4[ \subset ]-\frac\pi2, \frac\pi2[$. Sa tangente vaut $\frac1{239}$, donc, par définition de $\arctan$, il vaut $\arctan\frac1{239}$. D'où la formule.
`,
  },
  {
    id: 'p3-m-newton-sqrt',
    problem: 3,
    kind: 'math',
    title: 'Récurrence de Newton pour x² − a',
    stars: 3,
    source: 'TP Pb3 C Q1',
    tags: ['newton'],
    statement: md`
La méthode de Newton pour $f(x) = 0$ s'écrit $x_{k+1} = x_k - \frac{f(x_k)}{f'(x_k)}$. Vérifier que pour $f(x) = x^2 - a$ on obtient $x_{k+1} = \frac12\left(x_k + \frac{a}{x_k}\right)$.

Calculer $x_1$ et $x_2$ pour $a = 2$ et $x_0 = 2$.
`,
    answer: md`$x_{k+1} = x_k - \frac{x_k^2 - a}{2x_k} = \frac{x_k^2 + a}{2x_k}$ ; $x_1 = 1.5$, $x_2 = \frac{17}{12} \approx 1.41667$.`,
    solution: md`
$f'(x) = 2x$, donc
$$x_{k+1} = x_k - \frac{x_k^2 - a}{2x_k} = \frac{2x_k^2 - x_k^2 + a}{2x_k} = \frac{x_k^2 + a}{2x_k} = \frac12\left(x_k + \frac{a}{x_k}\right).$$

Avec $a = 2$ et $x_0 = 2$ : $x_1 = \frac12(2 + 1) = \frac32$, puis $x_2 = \frac12\left(\frac32 + \frac43\right) = \frac{17}{12} \approx 1.4167$ ($\sqrt2 \approx 1.4142$).
`,
  },
  {
    id: 'p3-m-newton-nth',
    problem: 3,
    kind: 'math',
    title: 'Récurrence de Newton pour xⁿ − a',
    stars: 2,
    source: 'TP Pb3 C.2',
    tags: ['newton'],
    statement: md`
Écrire la récurrence de Newton pour $f(x) = x^n - a$ (racine $n$-ième de $a$), sous une forme simplifiée.
`,
    answer: md`$x_{k+1} = \dfrac{(n-1)x_k + a/x_k^{n-1}}{n}$`,
    solution: md`
$f'(x) = n x^{n-1}$, donc
$$x_{k+1} = x_k - \frac{x_k^n - a}{n x_k^{n-1}} = \frac{n x_k^n - x_k^n + a}{n x_k^{n-1}} = \frac1n\left((n-1)\,x_k + \frac{a}{x_k^{n-1}}\right).$$
Pour $n = 2$, on retrouve $\frac12\left(x_k + \frac{a}{x_k}\right)$.
`,
  },
  {
    id: 'p3-m-quadratique',
    problem: 3,
    kind: 'math',
    title: 'Vitesse de convergence de Newton',
    stars: 2,
    source: 'TP Pb3 C.1 Q3',
    tags: ['newton'],
    statement: md`
En calculant $\sqrt2$ par Newton, comment évolue le nombre de décimales correctes d'une itération à l'autre ? Pourquoi la méthode s'arrête-t-elle après quelques itérations seulement ?
`,
    answer: md`Il **double** environ à chaque itération (convergence quadratique) ; après 5 ou 6 itérations, on atteint la précision des floats (~16 chiffres).`,
    solution: md`
On a $x_{k+1} - \sqrt a = \frac{(x_k - \sqrt a)^2}{2x_k}$ : l'erreur est **élevée au carré** à chaque étape. Si $|x_k - \sqrt a| \approx 10^{-n}$, alors $|x_{k+1} - \sqrt a| \approx 10^{-2n}$, donc le nombre de décimales correctes double.

Exemple : $x_0 = 2$, puis $1.5$, $1.41667$, $1.4142157$, $1.41421356237469$, $1.414213562373095$. Une fois les ~16 chiffres significatifs atteints, $x_{k+1} = x_k$ (ou presque) et le critère d'arrêt relatif se déclenche.
`,
  },
  {
    id: 'p3-m-newton-erreur',
    problem: 3,
    kind: 'math',
    title: 'Newton : positivité et formule de l’erreur',
    stars: 2,
    source: 'TP Pb3 C.3',
    tags: ['newton', 'preuve'],
    statement: md`
Soit $a > 0$, $x_0 \ge \sqrt a$ et $x_{k+1} = \frac12\left(x_k + \frac{a}{x_k}\right)$.
1. Justifier que $x_k > 0$ pour tout $k$.
2. Exprimer $x_{k+1} - \sqrt a$ en fonction de $(x_k - \sqrt a)^2$.
3. En déduire que si $|x_k - \sqrt a| \le 10^{-n}$, alors $|x_{k+1} - \sqrt a| \le \frac{10^{-2n}}{2\sqrt a}$ (on admet $x_k \ge \sqrt a$).
`,
    answer: md`1. Récurrence : $x_k > 0 \Rightarrow a/x_k > 0$. 2. $x_{k+1} - \sqrt a = \frac{(x_k - \sqrt a)^2}{2x_k}$. 3. $2x_k \ge 2\sqrt a$.`,
    solution: md`
1. $x_0 \ge \sqrt a > 0$ ; si $x_k > 0$, alors $\frac a{x_k} > 0$, donc $x_{k+1} > 0$. Par récurrence, $x_k > 0$ pour tout $k$.
2. $x_{k+1} - \sqrt a = \dfrac{x_k^2 + a - 2\sqrt a\, x_k}{2x_k} = \dfrac{(x_k - \sqrt a)^2}{2x_k}$.
3. Comme $x_k \ge \sqrt a$ : $|x_{k+1} - \sqrt a| = \dfrac{(x_k - \sqrt a)^2}{2x_k} \le \dfrac{10^{-2n}}{2\sqrt a}$.
`,
  },
  {
    id: 'p3-m-newton-conv',
    problem: 3,
    kind: 'math',
    title: 'Newton : la suite décroît vers √a',
    stars: 1,
    source: 'TP Pb3 C.3',
    tags: ['newton', 'preuve'],
    statement: md`
Avec les mêmes notations ($x_0 \ge \sqrt a$), montrer que $x_k \ge \sqrt a$ pour tout $k$, que $(x_k)$ est décroissante, puis qu'elle converge vers $\sqrt a$.
`,
    answer: md`$x_{k+1} - \sqrt a = \frac{(x_k-\sqrt a)^2}{2x_k} \ge 0$ ; $x_{k+1} - x_k = \frac{a - x_k^2}{2x_k} \le 0$ ; décroissante et minorée, donc convergente ; la limite vérifie $L^2 = a$.`,
    solution: md`
- $x_{k+1} - \sqrt a = \frac{(x_k - \sqrt a)^2}{2x_k} \ge 0$ (car $x_k > 0$), donc $x_k \ge \sqrt a$ pour tout $k \ge 1$ (et pour $k = 0$ par hypothèse).
- $x_{k+1} - x_k = \frac12\left(\frac a{x_k} - x_k\right) = \frac{a - x_k^2}{2x_k} \le 0$ car $x_k^2 \ge a$ : la suite est décroissante.
- Décroissante et minorée par $\sqrt a$, elle converge vers $L \ge \sqrt a > 0$. Par passage à la limite, $L = \frac12\left(L + \frac aL\right)$, d'où $L^2 = a$ et $L = \sqrt a$.
`,
  },
]
