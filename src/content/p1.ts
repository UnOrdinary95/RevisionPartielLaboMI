import { md, py } from './md'
import type { Exercise } from './types'

const RAPPEL_COMPLEXES = md`
- $z = a + ib$ : $\mathrm{Re}(z) = a$, $\mathrm{Im}(z) = b$
- Somme : $(a+ib) + (c+id) = (a+c) + i(b+d)$
- Produit : $(a+ib)(c+id) = (ac - bd) + i(ad + bc)$ (car $i^2 = -1$)
- Module : $|a+ib| = \sqrt{a^2+b^2}$ (distance à l'origine)
- Conjugué : $\overline{a+ib} = a - ib$, et $z\,\overline{z} = a^2 + b^2 = |z|^2$ (un réel)
- Inverse / quotient : on multiplie en haut et en bas par le **conjugué du dénominateur** :
  $\dfrac{1}{a+ib} = \dfrac{a - ib}{(a+ib)(a-ib)} = \dfrac{a - ib}{a^2+b^2}$
`

const RAPPEL_SUITE = md`
Suite de Mandelbrot associée à $c$ :
$$z_0 = 0, \qquad z_{n+1} = z_n^2 + c$$
$c \in M$ (ensemble de Mandelbrot) si la suite reste **bornée**. Résultat admis : dès qu'un terme vérifie $|z_k| > 2$, la suite part à l'infini, donc $c \notin M$.

En Python : §complex(1, 1)§ ou §1+1j§, §z.real§, §z.imag§, §abs(z)§ (module).
`

const COMPLEXE_SETUP = py`
class Complexe:
    def __init__(self, re, im):
        self.re = re
        self.im = im
    def __repr__(self):
        return f"Complexe({self.re}, {self.im})"
    def __add__(self, other):
        return Complexe(self.re + other.re, self.im + other.im)
    def __mul__(self, other):
        return Complexe(self.re * other.re - self.im * other.im,
                        self.re * other.im + self.im * other.re)
    def module(self):
        return (self.re ** 2 + self.im ** 2) ** 0.5
`

const DANSM_SETUP = py`
def dansM(c, rang):
    z = 0
    for _ in range(rang):
        z = z * z + c
        if abs(z) > 2:
            return False
    return True
`

export const P1: Exercise[] = [
  // ───────────────────────────── CODE ─────────────────────────────
  {
    id: 'p1-complexe-classe',
    problem: 1,
    kind: 'code',
    title: 'Classe Complexe (annale partiel 2025)',
    stars: 3,
    source: 'Partiel 2025-26 Ex1',
    tags: ['classe', 'complexes'],
    statement: md`
Écrire une classe §Complexe§ pour représenter et manipuler les nombres complexes. Un objet de la classe aura **deux attributs** : la partie réelle et la partie imaginaire. La classe contiendra :

- le constructeur §__init__§ qui prend en paramètres la partie réelle et la partie imaginaire ;
- la méthode d'affichage §__repr__§ (voir exemples) ;
- la méthode spéciale §__add__§ qui renvoie la somme de deux complexes ;
- la méthode spéciale §__mul__§ qui renvoie le produit de deux complexes ;
- une méthode §module§ qui renvoie le module du nombre complexe.

'''
>>> Complexe(3, -1)
Complexe(3, -1)
>>> Complexe(1, -1) + Complexe(2, 1)
Complexe(3, 0)
>>> Complexe(2, 1) * Complexe(1, 3)
Complexe(-1, 7)
>>> Complexe(2, -1).module()
2.23606797749979
'''
`,
    reminder: RAPPEL_COMPLEXES,
    starter: py`
class Complexe:
    def __init__(self, re, im):
        pass
`,
    tests: [
      { expr: 'Complexe(3, -1)', expected: 'Complexe(3, -1)', mode: 'repr' },
      { expr: 'Complexe(1, -1) + Complexe(2, 1)', expected: 'Complexe(3, 0)', mode: 'repr' },
      { expr: 'Complexe(2, 1) * Complexe(1, 3)', expected: 'Complexe(-1, 7)', mode: 'repr' },
      { expr: 'Complexe(0, 1) * Complexe(0, 1)', expected: 'Complexe(-1, 0)', mode: 'repr' },
      { expr: 'Complexe(2, -1).module()', expected: '2.23606797749979', mode: 'approx' },
      { expr: 'Complexe(3, 4).module()', expected: '5.0', mode: 'approx' },
      {
        label: 'add/mul ne modifient pas les opérandes',
        script: py`
a = Complexe(1, 2); b = Complexe(3, 4)
a + b; a * b
ok = repr(a) == "Complexe(1, 2)" and repr(b) == "Complexe(3, 4)"
got = (a, b)`,
      },
    ],
    solution: md`
'''python
import math

class Complexe:
    def __init__(self, re, im):
        self.re = re
        self.im = im

    def __repr__(self):
        return f"Complexe({self.re}, {self.im})"

    def __add__(self, other):
        return Complexe(self.re + other.re, self.im + other.im)

    def __mul__(self, other):
        # (a+ib)(c+id) = (ac - bd) + i(ad + bc)
        return Complexe(self.re * other.re - self.im * other.im,
                        self.re * other.im + self.im * other.re)

    def module(self):
        return math.sqrt(self.re ** 2 + self.im ** 2)
'''
**Points clés** : §__add__§ et §__mul__§ renvoient un **nouvel** objet sans modifier §self§. Le produit se développe avec $i^2=-1$.
`,
  },
  {
    id: 'p1-complexe-etendue',
    problem: 1,
    kind: 'code',
    title: 'Complexe : soustraction, opposé, conjugué, égalité, affichage',
    stars: 2,
    source: 'Variante classe Complexe',
    tags: ['classe', 'complexes'],
    statement: md`
On dispose de la classe §Complexe§ ci-dessous (attributs §re§ et §im§). Ajouter :

- §__sub__§ (différence), §__neg__§ (opposé) ;
- §conjugue§ qui renvoie le conjugué ;
- §__eq__§ (égalité des parties réelles et imaginaires) ;
- §__str__§ qui affiche le complexe sous forme usuelle :

'''
>>> print(Complexe(2, 3))
2+3i
>>> print(Complexe(3, -1))
3-i
>>> print(Complexe(0, 1))
i
>>> print(Complexe(0, -2))
-2i
>>> print(Complexe(5, 0))
5
>>> print(Complexe(0, 0))
0
>>> Complexe(1, 2).conjugue()
Complexe(1, -2)
>>> Complexe(1, 2) == Complexe(1, 2)
True
'''
`,
    reminder: RAPPEL_COMPLEXES,
    starter: py`
class Complexe:
    def __init__(self, re, im):
        self.re = re
        self.im = im

    def __repr__(self):
        return f"Complexe({self.re}, {self.im})"

    def __add__(self, other):
        return Complexe(self.re + other.re, self.im + other.im)

    def __sub__(self, other):
        pass

    def __neg__(self):
        pass

    def conjugue(self):
        pass

    def __eq__(self, other):
        pass

    def __str__(self):
        pass
`,
    tests: [
      { expr: 'Complexe(5, 2) - Complexe(1, 3)', expected: 'Complexe(4, -1)', mode: 'repr' },
      { expr: '-Complexe(1, -2)', expected: 'Complexe(-1, 2)', mode: 'repr' },
      { expr: 'Complexe(1, 2).conjugue()', expected: 'Complexe(1, -2)', mode: 'repr' },
      { expr: 'Complexe(1, 2) == Complexe(1, 2)', expected: 'True' },
      { expr: 'Complexe(1, 2) == Complexe(2, 1)', expected: 'False' },
      { expr: 'str(Complexe(2, 3))', expected: '2+3i', mode: 'str' },
      { expr: 'str(Complexe(3, -1))', expected: '3-i', mode: 'str' },
      { expr: 'str(Complexe(0, 1))', expected: 'i', mode: 'str' },
      { expr: 'str(Complexe(0, -2))', expected: '-2i', mode: 'str' },
      { expr: 'str(Complexe(5, 0))', expected: '5', mode: 'str' },
      { expr: 'str(Complexe(0, 0))', expected: '0', mode: 'str' },
      { expr: 'str(Complexe(-1, 1))', expected: '-1+i', mode: 'str' },
    ],
    solution: md`
'''python
class Complexe:
    def __init__(self, re, im):
        self.re = re
        self.im = im

    def __repr__(self):
        return f"Complexe({self.re}, {self.im})"

    def __add__(self, other):
        return Complexe(self.re + other.re, self.im + other.im)

    def __sub__(self, other):
        return Complexe(self.re - other.re, self.im - other.im)

    def __neg__(self):
        return Complexe(-self.re, -self.im)

    def conjugue(self):
        return Complexe(self.re, -self.im)

    def __eq__(self, other):
        return self.re == other.re and self.im == other.im

    def __str__(self):
        a, b = self.re, self.im
        if b == 0:
            return str(a)
        if b == 1:
            partie_im = "i"
        elif b == -1:
            partie_im = "-i"
        else:
            partie_im = f"{b}i"
        if a == 0:
            return partie_im
        if b > 0:
            return f"{a}+{partie_im}"
        return f"{a}{partie_im}"   # le signe - est déjà dans partie_im
'''
Pour §__str__§, on traite d'abord les cas particuliers ($b=0$, $b=\pm1$, $a=0$), puis on ajoute un §+§ seulement si $b>0$.
`,
  },
  {
    id: 'p1-suite',
    problem: 1,
    kind: 'code',
    title: 'suite(n, c) : terme de rang n',
    stars: 3,
    source: 'TP Pb1 A',
    tags: ['suite', 'complexes'],
    statement: md`
Écrire une fonction §suite(n, c)§ qui prend en paramètres un entier §n§ et un complexe §c§ (type §complex§ de Python) et renvoie $z_n$, où $z_0 = 0$ et $z_{k+1} = z_k^2 + c$.

'''
>>> suite(3, 1+1j)
(-7+7j)
>>> suite(0, 2j)
0
'''
`,
    reminder: RAPPEL_SUITE,
    starter: py`
def suite(n, c):
    pass
`,
    tests: [
      { expr: 'suite(3, 1+1j)', expected: '(-7+7j)' },
      { expr: 'suite(0, 2j)', expected: '0' },
      { expr: 'suite(1, 0.5+2j)', expected: '0.5+2j' },
      { expr: 'suite(2, 1j)', expected: '(-1+1j)' },
      { expr: 'suite(4, -1)', expected: '0' },
      { expr: 'suite(3, 1)', expected: '5' },
    ],
    solution: md`
'''python
def suite(n, c):
    z = 0
    for _ in range(n):
        z = z * z + c
    return z
'''
On applique $n$ fois la relation de récurrence en partant de $z_0 = 0$.
`,
  },
  {
    id: 'p1-suite-classe',
    problem: 1,
    kind: 'code',
    title: 'Suite de Mandelbrot avec sa propre classe Complexe',
    stars: 2,
    source: 'Variante (lien classe + suite)',
    tags: ['suite', 'classe'],
    statement: md`
La classe §Complexe§ de l'annale est fournie (attributs §re§, §im§, méthodes §__add__§, §__mul__§, §module§, §__repr__§). **Sans utiliser le type §complex§**, écrire :

1. §suite_mandel(n, c)§ qui renvoie $z_n$ (un §Complexe§) pour un §c§ de type §Complexe§ ;
2. §dansM_classe(c, rang)§ qui renvoie §False§ dès que $|z_k| > 2$ pour un $k \le$ §rang§, et §True§ sinon.

'''
>>> suite_mandel(3, Complexe(1, 1))
Complexe(-7, 7)
>>> dansM_classe(Complexe(-1, 0), 100)
True
'''
`,
    reminder: RAPPEL_SUITE,
    setup: COMPLEXE_SETUP,
    starter: py`
# La classe Complexe est déjà définie.

def suite_mandel(n, c):
    pass

def dansM_classe(c, rang):
    pass
`,
    forbid: ['complex'],
    tests: [
      { expr: 'suite_mandel(3, Complexe(1, 1))', expected: 'Complexe(-7, 7)', mode: 'repr' },
      { expr: 'suite_mandel(0, Complexe(1, 1))', expected: 'Complexe(0, 0)', mode: 'repr' },
      { expr: 'suite_mandel(2, Complexe(0, 1))', expected: 'Complexe(-1, 1)', mode: 'repr' },
      { expr: 'dansM_classe(Complexe(-1, 0), 100)', expected: 'True' },
      { expr: 'dansM_classe(Complexe(1, 1), 100)', expected: 'False' },
      { expr: 'dansM_classe(Complexe(0, 0), 100)', expected: 'True' },
    ],
    solution: md`
'''python
def suite_mandel(n, c):
    z = Complexe(0, 0)
    for _ in range(n):
        z = z * z + c
    return z

def dansM_classe(c, rang):
    z = Complexe(0, 0)
    for _ in range(rang):
        z = z * z + c
        if z.module() > 2:
            return False
    return True
'''
Grâce à §__add__§ et §__mul__§, on peut écrire §z * z + c§ exactement comme avec le type §complex§. Il faut partir de §Complexe(0, 0)§ et pas de §0§, qui n'a pas de §__mul__§ avec un §Complexe§.
`,
  },
  {
    id: 'p1-dansM',
    problem: 1,
    kind: 'code',
    title: 'dansM(c, rang) efficace',
    stars: 3,
    source: 'TP Pb1 B',
    tags: ['suite', 'efficacité'],
    statement: md`
Écrire une fonction §dansM(c, rang)§ qui détermine si $c$ appartient (approximativement) à l'ensemble de Mandelbrot : on calcule $z_1, z_2, \dots, z_{\text{rang}}$ et on renvoie §False§ dès qu'un terme dépasse 2 en module ; sinon on renvoie §True§.

⚠️ Il n'est **pas** efficace d'appeler une fonction §suite§ à chaque rang : on calcule les termes au fur et à mesure.

'''
>>> dansM(-1, 100)
True
>>> dansM(1+1j, 100)
False
'''
`,
    reminder: RAPPEL_SUITE,
    starter: py`
def dansM(c, rang):
    pass
`,
    forbid: ['suite'],
    tests: [
      { expr: 'dansM(0, 50)', expected: 'True' },
      { expr: 'dansM(-1, 100)', expected: 'True' },
      { expr: 'dansM(1+1j, 200)', expected: 'False' },
      { expr: 'dansM(-0.25+0.5j, 200)', expected: 'True' },
      { expr: 'dansM(0.5+0.5j, 200)', expected: 'False' },
      { expr: 'dansM(-2, 100)', expected: 'True' },
      { expr: 'dansM(1, 10)', expected: 'False' },
      { expr: 'dansM(1j, 200)', expected: 'True' },
    ],
    solution: md`
'''python
def dansM(c, rang):
    z = 0
    for _ in range(rang):
        z = z * z + c
        if abs(z) > 2:
            return False
    return True
'''
Coût : au plus **rang** itérations. En appelant §suite(k, c)§ pour $k = 1, \dots, n$, on ferait $1 + 2 + \dots + n = \frac{n(n+1)}{2}$ itérations.
`,
  },
  {
    id: 'p1-rang-echap',
    problem: 1,
    kind: 'code',
    title: "rang_echap(c, rang) : rang d'échappement",
    stars: 3,
    source: 'TP Pb1 F',
    tags: ['suite'],
    statement: md`
Le **rang d'échappement** de $c$ est le premier rang $k \ge 1$ tel que $|z_k| > 2$.

Écrire §rang_echap(c, rang)§ qui renvoie ce rang s'il est $\le$ §rang§, et §None§ sinon (on considère alors que $c \in M$).

'''
>>> rang_echap(1+1j, 100)
2
>>> rang_echap(0, 100)      # renvoie None
'''
`,
    reminder: RAPPEL_SUITE,
    starter: py`
def rang_echap(c, rang):
    pass
`,
    tests: [
      { expr: 'rang_echap(1+1j, 100)', expected: '2' },
      { expr: 'rang_echap(0, 100)', expected: 'None' },
      { expr: 'rang_echap(3, 100)', expected: '1' },
      { expr: 'rang_echap(1, 100)', expected: '3' },
      { expr: 'rang_echap(-1, 100)', expected: 'None' },
      { expr: 'rang_echap(0.5+0.5j, 200)', expected: '5' },
    ],
    solution: md`
'''python
def rang_echap(c, rang):
    z = 0
    for k in range(1, rang + 1):
        z = z * z + c
        if abs(z) > 2:
            return k
    return None
'''
C'est §dansM§ où l'on renvoie l'indice $k$ au lieu de §False§, et §None§ au lieu de §True§.
`,
  },
  {
    id: 'p1-argument',
    problem: 1,
    kind: 'code',
    title: 'argument(z) avec atan2',
    stars: 2,
    source: 'TP Pb1 E',
    tags: ['complexes'],
    statement: md`
Écrire une fonction §argument(z)§ qui renvoie un argument (dans $]-\pi, \pi]$) du complexe non nul §z§, à l'aide de la fonction §atan2§ du module §math§.

'''
>>> argument(1j)
1.5707963267948966
>>> argument(-1)
3.141592653589793
'''
`,
    reminder: md`
Si $z = a + ib = \rho\, e^{i\theta}$ avec $\rho = |z|$, alors $\cos\theta = a/\rho$, $\sin\theta = b/\rho$.

§math.atan2(y, x)§ renvoie l'angle $\theta \in ]-\pi, \pi]$ du point $(x, y)$ : **attention à l'ordre (y d'abord)**.
`,
    starter: py`
import math

def argument(z):
    pass
`,
    forbid: ['phase', 'cmath'],
    tests: [
      { expr: 'argument(1j)', expected: 'math.pi / 2', mode: 'approx' },
      { expr: 'argument(-1)', expected: 'math.pi', mode: 'approx' },
      { expr: 'argument(1+1j)', expected: 'math.pi / 4', mode: 'approx' },
      { expr: 'argument(-1j)', expected: '-math.pi / 2', mode: 'approx' },
      { expr: 'argument(-1-1j)', expected: '-3 * math.pi / 4', mode: 'approx' },
    ],
    setup: py`import math`,
    solution: md`
'''python
import math

def argument(z):
    return math.atan2(z.imag, z.real)
'''
§atan2§ tient compte du quadrant, contrairement à §atan(b / a)§, qui se trompe pour $a < 0$ et plante pour $a = 0$.
`,
  },
  {
    id: 'p1-cardioide',
    problem: 1,
    kind: 'code',
    title: 'dans_cardioide(z)',
    stars: 2,
    source: 'TP Pb1 E',
    tags: ['complexes', 'géométrie'],
    statement: md`
Pour tester si $z$ est à l'intérieur de la cardioïde principale, on calcule le module $\rho$ et un argument $\theta$ de $w = z - \frac14$, puis on teste
$$\rho \le \tfrac12\,(1 - \cos\theta).$$

Écrire §dans_cardioide(z)§ (renvoie un booléen).

'''
>>> dans_cardioide(0)
True
>>> dans_cardioide(1j)
False
'''
`,
    reminder: md`
- Module : §abs(w)§
- Argument : §math.atan2(w.imag, w.real)§
`,
    starter: py`
import math

def dans_cardioide(z):
    pass
`,
    tests: [
      { expr: 'dans_cardioide(0)', expected: 'True' },
      { expr: 'dans_cardioide(0.1+0.3j)', expected: 'True' },
      { expr: 'dans_cardioide(-0.7)', expected: 'True' },
      { expr: 'dans_cardioide(-0.76)', expected: 'False' },
      { expr: 'dans_cardioide(0.3)', expected: 'False' },
      { expr: 'dans_cardioide(1j)', expected: 'False' },
    ],
    solution: md`
'''python
import math

def dans_cardioide(z):
    w = z - 1/4
    rho = abs(w)
    theta = math.atan2(w.imag, w.real)
    return rho <= (1 - math.cos(theta)) / 2
'''
`,
  },
  {
    id: 'p1-grille',
    problem: 1,
    kind: 'code',
    title: 'Grille de points sans numpy',
    stars: 1,
    source: 'TP Pb1 C (version sans graphique)',
    tags: ['grille'],
    statement: md`
1. Écrire §linspace(a, b, n)§ ($n \ge 2$) qui renvoie la liste des $n$ réels régulièrement espacés de $a$ à $b$ inclus.
2. Écrire §points_dans_M(n, rang)§ qui parcourt la grille $n \times n$ couvrant $D = [-2, 2] \times [-2, 2]$ (partie réelle en boucle extérieure, partie imaginaire en boucle intérieure) et renvoie la liste des complexes de la grille qui sont dans $M$ (fonction §dansM(c, rang)§ fournie).

'''
>>> linspace(0, 1, 5)
[0.0, 0.25, 0.5, 0.75, 1.0]
>>> points_dans_M(3, 50)
[(-2+0j), 0j]
'''
`,
    reminder: md`
Le pas vaut $h = \dfrac{b - a}{n - 1}$ et les points sont $x_i = a + i\,h$ pour $i = 0, \dots, n-1$.
`,
    setup: DANSM_SETUP,
    starter: py`
# dansM(c, rang) est fournie

def linspace(a, b, n):
    pass

def points_dans_M(n, rang):
    pass
`,
    forbid: ['numpy', 'np'],
    tests: [
      { expr: 'linspace(0, 1, 5)', expected: '[0.0, 0.25, 0.5, 0.75, 1.0]' },
      { expr: 'linspace(-2, 2, 3)', expected: '[-2.0, 0.0, 2.0]' },
      { expr: 'len(linspace(-2, 2, 100))', expected: '100' },
      { expr: 'points_dans_M(3, 50)', expected: '[(-2+0j), 0j]' },
      { expr: 'len(points_dans_M(5, 50))', expected: '5' },
    ],
    solution: md`
'''python
def linspace(a, b, n):
    h = (b - a) / (n - 1)
    return [a + i * h for i in range(n)]

def points_dans_M(n, rang):
    res = []
    for x in linspace(-2, 2, n):
        for y in linspace(-2, 2, n):
            c = complex(x, y)
            if dansM(c, rang):
                res.append(c)
    return res
'''
`,
  },
  {
    id: 'p1-dansJ',
    problem: 1,
    kind: 'code',
    title: 'dansJ(alpha, c, rang) : ensemble de Julia',
    stars: 1,
    source: 'TP Pb1 H',
    tags: ['suite', 'julia'],
    statement: md`
Pour un ensemble de Julia $J_c$, la suite est $z_0 = \alpha$, $z_{n+1} = z_n^2 + c$. On utilise le seuil $R = 2$ (valable si $|c| \le 2$) : si un terme vérifie $|z_k| > 2$, la suite diverge.

Écrire §dansJ(alpha, c, rang)§ qui teste les termes $z_0, z_1, \dots, z_{\text{rang}}$ et renvoie §False§ dès que l'un d'eux dépasse 2 en module, §True§ sinon.

'''
>>> dansJ(0, 0, 50)
True
>>> dansJ(1.5, 0, 50)
False
'''
`,
    reminder: md`
Seule différence avec Mandelbrot : on part de $z_0 = \alpha$ (le point testé), et $c$ est **fixé**.
`,
    starter: py`
def dansJ(alpha, c, rang):
    pass
`,
    tests: [
      { expr: 'dansJ(0, 0, 50)', expected: 'True' },
      { expr: 'dansJ(1.5, 0, 50)', expected: 'False' },
      { expr: 'dansJ(1, 0, 50)', expected: 'True' },
      { expr: 'dansJ(0, -1, 50)', expected: 'True' },
      { expr: 'dansJ(3, 0, 10)', expected: 'False' },
      { expr: 'dansJ(0.3+0.3j, 0.35+0.35j, 200)', expected: 'True' },
    ],
    solution: md`
'''python
def dansJ(alpha, c, rang):
    z = alpha
    for _ in range(rang + 1):
        if abs(z) > 2:
            return False
        z = z * z + c
    return True
'''
`,
  },

  // ───────────────────────────── MATHS ─────────────────────────────
  {
    id: 'p1-m-termes-1pi',
    problem: 1,
    kind: 'math',
    title: 'Termes de la suite pour c = 1 + i',
    stars: 3,
    source: 'TP Pb1 A',
    tags: ['calcul', 'complexes'],
    statement: md`
Calculer à la main $z_0, z_1, z_2, z_3$ pour la suite $z_0 = 0$, $z_{n+1} = z_n^2 + c$ avec $c = 1 + i$. Que peut-on en conclure sur l'appartenance de $c$ à $M$ ?
`,
    reminder: RAPPEL_COMPLEXES,
    answer: md`$z_1 = 1+i$, $z_2 = 1+3i$, $z_3 = -7+7i$ ; $c \notin M$.`,
    solution: md`
- $z_0 = 0$
- $z_1 = 0^2 + c = 1 + i$
- $z_2 = (1+i)^2 + (1+i) = (1 + 2i - 1) + 1 + i = 1 + 3i$
- $z_3 = (1+3i)^2 + (1+i) = (1 + 6i - 9) + 1 + i = -7 + 7i$

$|z_2| = \sqrt{1+9} = \sqrt{10} > 2$, donc la suite diverge : $c \notin M$.
`,
  },
  {
    id: 'p1-m-termes-i',
    problem: 1,
    kind: 'math',
    title: 'Termes de la suite pour c = i (cycle)',
    stars: 3,
    source: 'Variante TP Pb1 A',
    tags: ['calcul', 'complexes'],
    statement: md`
On note $(z_n)$ la suite définie par $z_0 = 0$ et $z_{n+1} = z_n^2 + c$. Le nombre $c$ appartient à l'ensemble de Mandelbrot $M$ si cette suite est **bornée**.

Calculer $z_1, z_2, z_3, z_4$ pour $c = i$. En déduire que la suite est périodique à partir d'un certain rang, puis que $i \in M$.
`,
    reminder: RAPPEL_SUITE + '\n' + RAPPEL_COMPLEXES,
    answer: md`$z_1 = i$, $z_2 = -1+i$, $z_3 = -i$, $z_4 = -1+i = z_2$ : la suite est périodique, donc bornée, donc $i \in M$.`,
    solution: md`
- $z_1 = i$
- $z_2 = i^2 + i = -1 + i$
- $z_3 = (-1+i)^2 + i = (1 - 2i - 1) + i = -i$
- $z_4 = (-i)^2 + i = -1 + i = z_2$

Comme $z_4 = z_2$ et que chaque terme ne dépend que du précédent, la suite alterne entre $-1+i$ et $-i$ à partir du rang 2. Elle prend un nombre fini de valeurs, de module au plus $\sqrt2$ : elle est **bornée**, donc $i \in M$.
`,
  },
  {
    id: 'p1-m-termes-reels',
    problem: 1,
    kind: 'math',
    title: 'Appartenance à M pour c = −1, −2, 1, 1/4',
    stars: 1,
    source: 'Variante TP Pb1 A',
    tags: ['calcul'],
    statement: md`
On note $(z_n)$ la suite définie par $z_0 = 0$ et $z_{n+1} = z_n^2 + c$. Le nombre $c$ appartient à l'ensemble de Mandelbrot $M$ si cette suite est **bornée**.

Pour chacune des valeurs $c = -1$, $c = -2$, $c = 1$ et $c = \tfrac14$, calculer les premiers termes de la suite et dire (en justifiant brièvement) si $c \in M$.
`,
    reminder: RAPPEL_SUITE,
    answer: md`$-1 \in M$ (cycle $0, -1$) ; $-2 \in M$ (stationnaire en $2$) ; $1 \notin M$ ($z_3 = 5$) ; $\tfrac14 \in M$ ($|c| \le \tfrac14$).`,
    solution: md`
- $c = -1$ : $0, -1, 0, -1, \dots$ périodique, donc borné : $-1 \in M$.
- $c = -2$ : $0, -2, 2, 2, 2, \dots$ ($2^2 - 2 = 2$), stationnaire et jamais $> 2$ : $-2 \in M$.
- $c = 1$ : $0, 1, 2, 5, \dots$ et $|z_3| = 5 > 2$ : $1 \notin M$.
- $c = \tfrac14$ : $|c| \le \tfrac14$, donc $|z_n| \le \tfrac12$ pour tout $n$ (disque inclus dans $M$) : $\tfrac14 \in M$. Les termes croissent vers $\tfrac12$ : $0, 0.25, 0.3125, \dots$
`,
  },
  {
    id: 'p1-m-ops',
    problem: 1,
    kind: 'math',
    title: 'Calculs de base sur les complexes',
    stars: 3,
    source: 'Prérequis (annale Complexe)',
    tags: ['calcul', 'complexes'],
    statement: md`
Calculer :
1. $(2 + i)(1 + 3i)$
2. $|2 - i|$ et $|3 + 4i|$
3. $\overline{3 - 4i}$ et $z\,\overline{z}$ pour $z = 3 - 4i$
4. $\dfrac{1}{1 + i}$ sous forme algébrique
`,
    reminder: RAPPEL_COMPLEXES,
    answer: md`1. $-1 + 7i$ · 2. $\sqrt5$ et $5$ · 3. $3 + 4i$ et $25$ · 4. $\tfrac12 - \tfrac12 i$`,
    solution: md`
1. $(2+i)(1+3i) = 2 + 6i + i + 3i^2 = -1 + 7i$ (c'est l'exemple de l'annale).
2. $|2-i| = \sqrt{4+1} = \sqrt5 \approx 2.236$ ; $|3+4i| = \sqrt{9+16} = 5$.
3. $\overline{3-4i} = 3+4i$ ; $z\bar z = |z|^2 = 25$.
4. On multiplie par le conjugué : $\dfrac{1}{1+i} = \dfrac{1-i}{(1+i)(1-i)} = \dfrac{1-i}{2}$.
`,
  },
  {
    id: 'p1-m-algo-erreur',
    problem: 1,
    kind: 'math',
    title: "Limite de l'algorithme d'appartenance",
    stars: 1,
    source: 'TP Pb1 B',
    tags: ['algorithme'],
    statement: md`
Rappel : $c \in M$ (ensemble de Mandelbrot) si la suite $z_0 = 0$, $z_{n+1} = z_n^2 + c$ est bornée.

L'algorithme §dansM(c, rang)§ calcule les termes jusqu'au rang §rang§ et conclut $c \in M$ si aucun terme n'a dépassé 2 en module.

Dans quel cas peut-il se tromper ? Peut-il se tromper dans l'autre sens (dire $c \notin M$ alors que $c \in M$) ?
`,
    reminder: RAPPEL_SUITE,
    answer: md`Faux positif possible ($c \notin M$ mais échappement après §rang§) ; pas de faux négatif.`,
    solution: md`
- Si $c \notin M$ mais que la suite ne dépasse 2 qu'**après** le rang §rang§ (rang d'échappement $>$ §rang§), l'algorithme répond à tort $c \in M$. Ça arrive près de la frontière de $M$.
- L'autre erreur est impossible : si un terme dépasse 2, la suite tend vers l'infini (résultat admis), donc la conclusion $c \notin M$ est toujours juste.

Augmenter §rang§ réduit les faux positifs, mais coûte plus de calcul.
`,
  },
  {
    id: 'p1-m-cout',
    problem: 1,
    kind: 'math',
    title: 'Coût : appeler suite à chaque rang vs dansM',
    stars: 2,
    source: 'TP Pb1 B (style « valeur exacte »)',
    tags: ['complexité'],
    statement: md`
On note $(z_n)$ la suite définie par $z_0 = 0$ et $z_{n+1} = z_n^2 + c$. Le nombre $c$ appartient à l'ensemble de Mandelbrot $M$ si cette suite est **bornée**.

Pour tester l'appartenance à $M$ jusqu'au rang $n$, une version naïve calcule §suite(k, c)§ pour $k = 1, 2, \dots, n$ (chaque appel repart de $z_0$).

Combien d'itérations ($z \leftarrow z^2 + c$) fait-elle au total, dans le pire cas ? Et §dansM§ ? Donner des valeurs exactes.
`,
    reminder: RAPPEL_SUITE,
    answer: md`Naïf : $\frac{n(n+1)}{2}$ itérations ; §dansM§ : $n$.`,
    solution: md`
§suite(k, c)§ fait $k$ itérations, donc au total
$$1 + 2 + \dots + n = \frac{n(n+1)}{2}$$
(complexité quadratique). §dansM§ réutilise $z_{k}$ pour calculer $z_{k+1}$ : **$n$ itérations** au plus (linéaire).
`,
  },
  {
    id: 'p1-m-M-dans-D',
    problem: 1,
    kind: 'math',
    title: 'Justifier M ⊂ D',
    stars: 1,
    source: 'TP Pb1 C',
    tags: ['preuve'],
    statement: md`
On note $(z_n)$ la suite définie par $z_0 = 0$ et $z_{n+1} = z_n^2 + c$. Le nombre $c$ appartient à l'ensemble de Mandelbrot $M$ si cette suite est **bornée**.

On pose $D = \{z \in \mathbb{C} \mid -2 \le \mathrm{Re}(z) \le 2 \text{ et } -2 \le \mathrm{Im}(z) \le 2\}$. Expliquer pourquoi $M \subset D$.
`,
    reminder: RAPPEL_SUITE + '\n' + md`
Pour tout $z$ : $|\mathrm{Re}(z)| \le |z|$ et $|\mathrm{Im}(z)| \le |z|$ (car $|z|^2 = \mathrm{Re}(z)^2 + \mathrm{Im}(z)^2$).
`,
    answer: md`$z_1 = c$ ; si $c \in M$, $|c| = |z_1| \le 2$, donc $|\mathrm{Re}\,c|, |\mathrm{Im}\,c| \le 2$.`,
    solution: md`
Soit $c \in M$. On a $z_1 = z_0^2 + c = c$. Si l'on avait $|c| > 2$, la suite divergerait (critère $|z_k| > 2$) et $c \notin M$. Donc $|c| \le 2$.

Or $|\mathrm{Re}(c)| \le |c| \le 2$ et $|\mathrm{Im}(c)| \le |c| \le 2$, donc $c \in D$.
`,
  },
  {
    id: 'p1-m-disque',
    problem: 1,
    kind: 'math',
    title: 'Récurrence : disque de rayon 1/4 inclus dans M',
    stars: 2,
    source: 'TP Pb1 D.1',
    tags: ['récurrence', 'preuve'],
    statement: md`
On note $(z_n)$ la suite définie par $z_0 = 0$ et $z_{n+1} = z_n^2 + c$. Le nombre $c$ appartient à l'ensemble de Mandelbrot $M$ si cette suite est **bornée**.

Soit $c$ tel que $|c| \le \tfrac14$.
1. Montrer par récurrence que $|z_n| \le \tfrac12$ pour tout $n \in \mathbb{N}$.
2. En déduire un disque (centre, rayon) inclus dans $M$.
`,
    reminder: RAPPEL_SUITE + '\n' + md`
- Inégalité triangulaire : $|a + b| \le |a| + |b|$
- $|z^2| = |z|^2$
`,
    answer: md`$|z_{n+1}| \le |z_n|^2 + |c| \le \tfrac14 + \tfrac14 = \tfrac12$ ; disque fermé de centre $0$, rayon $\tfrac14$.`,
    solution: md`
**Initialisation** : $|z_0| = 0 \le \tfrac12$.

**Hérédité** : si $|z_n| \le \tfrac12$, alors
$$|z_{n+1}| = |z_n^2 + c| \le |z_n|^2 + |c| \le \tfrac14 + \tfrac14 = \tfrac12.$$

**Conclusion** : $|z_n| \le \tfrac12$ pour tout $n$ ; la suite est bornée, donc $c \in M$.

Le **disque fermé de centre $0$ et de rayon $\tfrac14$** est inclus dans $M$.
`,
  },
  {
    id: 'p1-m-symetries',
    problem: 1,
    kind: 'math',
    title: 'Symétries et transformations du plan',
    stars: 2,
    source: 'TP Pb1 D.2',
    tags: ['géométrie'],
    statement: md`
Rappel : $c \in M$ (ensemble de Mandelbrot) si la suite $z_0 = 0$, $z_{n+1} = z_n^2 + c$ est bornée.

À quelle transformation du plan correspond chacune des propriétés suivantes ?
1. Si $c \in M$ alors $\overline{c} \in M$.
2. Si $c \in M$ alors $-c \in M$.
3. Si $c \in M$ alors $-\overline{c} \in M$.

Laquelle est vérifiée par l'ensemble de Mandelbrot ?
`,
    reminder: RAPPEL_SUITE,
    answer: md`1 : axe réel · 2 : symétrie centrale (origine) · 3 : axe imaginaire. $M$ vérifie la 1.`,
    solution: md`
Avec $c = a + ib$ :
1. $\bar c = a - ib$ : symétrie **axiale par rapport à l'axe réel** (horizontal).
2. $-c = -a - ib$ : symétrie **centrale** de centre $O$.
3. $-\bar c = -a + ib$ : symétrie **axiale par rapport à l'axe imaginaire** (vertical).

$M$ est symétrique par rapport à l'axe réel (propriété 1). Les ensembles de Julia, eux, ont une symétrie centrale.
`,
  },
  {
    id: 'p1-m-cardioide-reim',
    problem: 1,
    kind: 'math',
    title: 'Partie réelle et imaginaire de la cardioïde',
    stars: 1,
    source: 'TP Pb1 D.3',
    tags: ['calcul', 'trigonométrie'],
    statement: md`
Soit $f(\theta) = \tfrac14 + \tfrac12 (1 - \cos\theta)\, e^{i\theta}$. Déterminer $\mathrm{Re}(f(\theta))$ et $\mathrm{Im}(f(\theta))$.
`,
    reminder: md`$e^{i\theta} = \cos\theta + i \sin\theta$`,
    answer: md`$\mathrm{Re} = \tfrac14 + \tfrac12\cos\theta(1-\cos\theta)$, $\mathrm{Im} = \tfrac12\sin\theta(1-\cos\theta)$`,
    solution: md`
$$f(\theta) = \tfrac14 + \tfrac12(1-\cos\theta)(\cos\theta + i\sin\theta)$$
d'où
$$\mathrm{Re}(f(\theta)) = \tfrac14 + \tfrac12\cos\theta\,(1 - \cos\theta), \qquad \mathrm{Im}(f(\theta)) = \tfrac12\sin\theta\,(1 - \cos\theta).$$
`,
  },
  {
    id: 'p1-m-acceleration',
    problem: 1,
    kind: 'math',
    title: 'Expliquer les accélérations du tracé',
    stars: 1,
    source: 'TP Pb1 E',
    tags: ['algorithme'],
    statement: md`
Rappel : $c \in M$ (ensemble de Mandelbrot) si la suite $z_0 = 0$, $z_{n+1} = z_n^2 + c$ est bornée.

Pour accélérer le tracé de $M$ par balayage d'une grille, on (1) ne fait pas appel à §dansM§ pour les points de module $\le \tfrac14$ et (2) ne parcourt que la moitié supérieure de la grille. Justifier chacune de ces deux idées, et dire pourquoi la première fait gagner beaucoup de temps.
`,
    reminder: RAPPEL_SUITE,
    answer: md`(1) disque $|c| \le \tfrac14$ inclus dans $M$ ; (2) symétrie par rapport à l'axe réel. Gain : les points de $M$ sont les plus coûteux (§rang§ itérations complètes).`,
    solution: md`
1. Le disque $|c| \le \tfrac14$ est inclus dans $M$ : ces points y sont **à coup sûr**. Ce sont précisément les points de $M$ qui coûtent le plus cher, car §dansM§ va jusqu'au bout des §rang§ itérations sans s'arrêter.
2. $M$ est symétrique par rapport à l'axe réel : si $x + iy \in M$, alors $x - iy \in M$. On calcule la moitié $y \ge 0$ et on ajoute les symétriques, ce qui divise environ par 2 le nombre d'appels.

(Même idée avec la cardioïde, qui contient le disque.)
`,
  },
  {
    id: 'p1-m-conjugue-rec',
    problem: 1,
    kind: 'math',
    title: 'Récurrence : la suite de c̄ est la conjuguée',
    stars: 2,
    source: 'TP Pb1 G.1',
    tags: ['récurrence', 'preuve'],
    statement: md`
On note $(z_n)$ la suite définie par $z_0 = 0$ et $z_{n+1} = z_n^2 + c$. Le nombre $c$ appartient à l'ensemble de Mandelbrot $M$ si cette suite est **bornée**.

Soit $(z_n)$ la suite associée à $c$ et $(w_n)$ celle associée à $\bar c$ ($w_0 = 0$, $w_{n+1} = w_n^2 + \bar c$).
1. Montrer par récurrence que $w_n = \overline{z_n}$ pour tout $n$.
2. En déduire que si $c \in M$, alors $\bar c \in M$.
`,
    reminder: RAPPEL_SUITE + '\n' + md`$\overline{a + b} = \bar a + \bar b$, $\overline{ab} = \bar a\, \bar b$ (donc $\overline{z^2} = \bar z^2$), $|\bar z| = |z|$.`,
    answer: md`$w_{n+1} = \overline{z_n}^2 + \bar c = \overline{z_n^2 + c} = \overline{z_{n+1}}$ ; puis $|w_n| = |z_n|$.`,
    solution: md`
**Initialisation** : $w_0 = 0 = \overline{0} = \overline{z_0}$.

**Hérédité** : si $w_n = \overline{z_n}$, alors
$$w_{n+1} = w_n^2 + \bar c = \overline{z_n}^{\,2} + \bar c = \overline{z_n^2} + \bar c = \overline{z_n^2 + c} = \overline{z_{n+1}}.$$

**Conséquence** : $|w_n| = |\overline{z_n}| = |z_n|$. Si $c \in M$, $(z_n)$ est bornée, donc $(w_n)$ aussi, et $\bar c \in M$ : $M$ est symétrique par rapport à l'axe réel.
`,
  },
  {
    id: 'p1-m-ineg-inverse',
    problem: 1,
    kind: 'math',
    title: 'Minoration |z_{n+1}| ≥ |z_n|² − |c|',
    stars: 1,
    source: 'TP Pb1 G.2.1',
    tags: ['inégalité'],
    statement: md`
On note $(z_n)$ la suite définie par $z_0 = 0$ et $z_{n+1} = z_n^2 + c$. Le nombre $c$ appartient à l'ensemble de Mandelbrot $M$ si cette suite est **bornée**.

Montrer que pour tout $n \in \mathbb{N}$ : $|z_{n+1}| \ge |z_n|^2 - |c|$.
`,
    reminder: RAPPEL_SUITE + '\n' + md`Inégalité triangulaire « inverse » : $|a + b| \ge |a| - |b|$.`,
    answer: md`$|z_{n+1}| = |z_n^2 + c| \ge |z_n^2| - |c| = |z_n|^2 - |c|$`,
    solution: md`
On applique $|a + b| \ge |a| - |b|$ avec $a = z_n^2$ et $b = c$ :
$$|z_{n+1}| = |z_n^2 + c| \ge |z_n^2| - |c| = |z_n|^2 - |c|,$$
car $|z^2| = |z|^2$ (module d'un produit).

*Preuve de l'inégalité inverse* : $|a| = |(a + b) - b| \le |a + b| + |b|$.
`,
  },
  {
    id: 'p1-m-c-sup-2',
    problem: 1,
    kind: 'math',
    title: 'Si |c| > 2, alors |z_n| ≥ |c| pour n ≥ 1',
    stars: 1,
    source: 'TP Pb1 G.2.2 a',
    tags: ['récurrence', 'preuve'],
    statement: md`
On note $(z_n)$ la suite définie par $z_0 = 0$ et $z_{n+1} = z_n^2 + c$. Le nombre $c$ appartient à l'ensemble de Mandelbrot $M$ si cette suite est **bornée**.

On suppose $|c| > 2$. Montrer par récurrence que $|z_n| \ge |c|$ pour tout $n \ge 1$ (on pourra utiliser $|z_{n+1}| \ge |z_n|^2 - |c|$).
`,
    reminder: RAPPEL_SUITE,
    answer: md`$|z_{n+1}| \ge |c|^2 - |c| = |c|(|c|-1) > |c|$ car $|c| - 1 > 1$.`,
    solution: md`
**Initialisation** : $z_1 = c$, donc $|z_1| = |c|$.

**Hérédité** : si $|z_n| \ge |c|$, alors
$$|z_{n+1}| \ge |z_n|^2 - |c| \ge |c|^2 - |c| = |c|\,(|c| - 1).$$
Comme $|c| > 2$, on a $|c| - 1 > 1$, donc $|c|(|c|-1) > |c|$ et $|z_{n+1}| \ge |c|$.

**Conclusion** : $|z_n| \ge |c|$ pour tout $n \ge 1$.
`,
  },
  {
    id: 'p1-m-julia-sym',
    problem: 1,
    kind: 'math',
    title: 'Symétrie centrale des ensembles de Julia',
    stars: 1,
    source: 'TP Pb1 H',
    tags: ['preuve'],
    statement: md`
Pour $J_c$, la suite est $z_0 = \alpha$, $z_{n+1} = z_n^2 + c$. Montrer que $\alpha \in J_c \iff -\alpha \in J_c$. Quelle symétrie en déduit-on ?
`,
    answer: md`Les suites issues de $\alpha$ et $-\alpha$ ont le même $z_1 = \alpha^2 + c$, donc coïncident à partir du rang 1 : symétrie centrale.`,
    solution: md`
Soit $(z_n)$ la suite issue de $\alpha$ et $(w_n)$ celle issue de $-\alpha$. On a
$$w_1 = (-\alpha)^2 + c = \alpha^2 + c = z_1,$$
puis, par récurrence immédiate, $w_n = z_n$ pour tout $n \ge 1$. Les deux suites sont donc bornées ou non en même temps : $\alpha \in J_c \iff -\alpha \in J_c$.

$J_c$ est symétrique par rapport à l'origine (**symétrie centrale**).
`,
  },
]
