# P3 · Floats, rationnels, calcul de $e$, $\pi$ et $\sqrt{a}$

#labo-mi #partiel

## Nombres à virgule flottante (`float`)

**Format IEEE 754, 64 bits** : $\pm\, m \times 2^{e}$, avec 1 bit de signe, 11 bits d'exposant et 52 bits de mantisse (53 avec le bit implicite).
→ Environ **15 à 16 chiffres significatifs** ($2^{-52} \approx 2{,}2\cdot10^{-16}$). C'est pourquoi `math.pi` et `math.e` n'ont que 15 décimales.

**Exactement représentables** : les nombres de la forme $\dfrac{k}{2^n}$, dont le développement binaire est fini.
- $0{,}25 = \frac14 = 0{,}01_2$ est exact.
- $0{,}2 = \frac15$ donne $0{,}0011\,0011\dots_2$, infini, donc **arrondi**.
- `0.1 + 0.2 != 0.3` : les trois nombres sont arrondis, et les erreurs ne se compensent pas.

> [!warning] Ne jamais tester `== 0` sur un calcul flottant
> $\det\begin{pmatrix}0.3&1\\0.9&3\end{pmatrix} = 0.3\cdot3 - 0.9$ donne $\approx -1{,}1\cdot10^{-16} \ne 0$ au lieu de $0$.
> ```python
> def mat_inversible(M, eps=1e-12):
>     (a, b), (c, d) = M
>     return abs(a*d - b*c) > eps
> ```
> Pour comparer deux floats : `math.isclose(x, y)` ou `abs(x - y) < eps`.

**Absorption** : $1 + \varepsilon = 1$ si $\varepsilon$ est plus petit qu'environ $10^{-16}$.
→ $\sum_{k=1}^{n} 1/k^4$ dans l'ordre croissant stagne : au-delà de $k \approx 10^4$, $1/k^4 < 10^{-16}$ et le terme est absorbé par la somme ($\approx 1{,}08$).
→ Remède : **sommer du plus petit au plus grand** (`range(n, 0, -1)`). Les petits termes s'accumulent avant d'être ajoutés au gros.

```python
s = 0
for k in range(n, 0, -1):
    s += 1 / k**4
```

---

## PGCD et fractions

**Algorithme d'Euclide** : $\gcd(a, b) = \gcd(b, a \bmod b)$ et $\gcd(a, 0) = a$.
```python
def pgcd(a, b):
    a, b = abs(a), abs(b)
    while b != 0:
        a, b = b, a % b
    return a
```

**Forme irréductible** $\frac{p}{q}$ : $q > 0$ et $\gcd(p, q) = 1$.
→ **Procédure** : on divise $a$ et $b$ par $\gcd(|a|, |b|)$, puis si le dénominateur est négatif, on change le signe des deux.
→ Exemples : $\frac{308}{196} = \frac{11}{7}$ (pgcd 28) et $\frac{110}{-132} = -\frac{5}{6}$ (pgcd 22).

**Unicité** (lemme de Gauss : si $a \mid bc$ et $\gcd(a, b) = 1$, alors $a \mid c$) :
$\frac ab = \frac cd \Rightarrow ad = bc$. Donc $b \mid ad$ avec $\gcd(a, b) = 1$, d'où $b \mid d$. De même $d \mid b$. Comme $b, d > 0$, on a $b = d$, puis $a = c$.

**Opérations**, avec $x = \frac ab$ et $y = \frac cd$ :
- $x + y = \dfrac{ad + bc}{bd}$, $\quad x - y = \dfrac{ad - bc}{bd}$
- $xy = \dfrac{ac}{bd}$, $\quad \dfrac{x}{y} = \dfrac{ad}{bc}$ (avec $c \ne 0$)
- **Comparaison** (pour $b, d > 0$) : $x < y \iff ad < bc$. On fait un produit en croix, **sans division** (sinon on obtient un float).

> [!tip] Classe `Rat` (annale du final 2024)
> ```python
> from math import gcd
> class Rat:
>     def __init__(self, num, den=1):
>         g = gcd(num, den)               # gcd(0, d) = |d|
>         num, den = num // g, den // g
>         if den < 0:
>             num, den = -num, -den
>         self.num, self.den = num, den
>     def __repr__(self):
>         return f"Rat({self.num}, {self.den})"
>     def __str__(self):
>         return str(self.num) if self.den == 1 else f"{self.num}/{self.den}"
>     def __add__(self, o):
>         return Rat(self.num*o.den + o.num*self.den, self.den*o.den)
>     def __mul__(self, o):
>         return Rat(self.num*o.num, self.den*o.den)
>     def __neg__(self):      return Rat(-self.num, self.den)
>     def __sub__(self, o):   return self + (-o)
>     def __truediv__(self, o): return Rat(self.num*o.den, self.den*o.num)
>     def __eq__(self, o):    return self.num == o.num and self.den == o.den
>     def __lt__(self, o):    return self.num*o.den < o.num*self.den
>     def __le__(self, o):    return self.num*o.den <= o.num*self.den
> ```
> Le constructeur garantit l'invariant (forme irréductible), donc `__eq__` peut comparer directement.

**Représentation décimale tronquée** à $n$ chiffres : on fait la division euclidienne de $10^n|a|$ par $b$.
```python
def to_dec_string(self, n):
    q = (10**n * abs(self.num)) // self.den
    s = str(q).zfill(n + 1)
    signe = "-" if self.num < 0 else ""
    return signe + s[:-n] + "." + s[-n:] if n > 0 else signe + s
```

**`Rat` contre `float`** : `Rat` est **exact** mais lent (numérateurs et dénominateurs géants). `float` est rapide mais limité à environ 16 chiffres.

---

## Calcul de $e$

**Taylor-Lagrange** en $a$ : $f(x) = \sum_{k=0}^{n}\dfrac{f^{(k)}(a)}{k!}(x-a)^k + \dfrac{f^{(n+1)}(c)}{(n+1)!}(x-a)^{n+1}$, avec $c$ entre $a$ et $x$.

Pour $f = \exp$, $a = 0$, $x = 1$ :
$$e = \sum_{k=0}^{n}\frac{1}{k!} + \frac{e^c}{(n+1)!},\quad c \in\, ]0,1[$$

**Erreur** : $0 < e - \sum_{k=0}^{n}\frac1{k!} = \dfrac{e^c}{(n+1)!} \le \dfrac{e}{(n+1)!} \le \dfrac{3}{(n+1)!}$
→ On utilise $e^c \le e$ car $\exp$ est croissante, et $e < 3$.

**$d$ décimales correctes** : il faut une erreur $< 10^{-(d+1)}$.

> [!tip] Factorielle incrémentale (annale du partiel 2025)
> $(k+1)! = k! \times (k+1)$ : on **recycle** la factorielle précédente.
> ```python
> s, fact = 0.0, 1
> for k in range(1, 21):
>     fact *= k             # fact = k!
>     s += 1 / fact
> # s = 1 + 1/2! + ... + 1/20!   (pas de math.factorial)
> ```
> Coût : $n$ multiplications, $n$ divisions et $n$ additions. Avec une factorielle recalculée à chaque terme, on passerait à $\approx \frac{n^2}{2}$ multiplications.

```python
def rang_approx_e(delta):        # plus petit n tel que 3/(n+1)! < delta
    n, fact = 0, 1               # fact = (n+1)!
    while 3 / fact >= delta:     # (ou 3 < delta*fact avec des Rat)
        n += 1
        fact *= n + 1
    return n

def approx_e(n):                 # somme des 1/k! pour k = 0..n, en Rat
    s, fact = Rat(1), 1
    for k in range(1, n + 1):
        fact *= k
        s = s + Rat(1, fact)
    return s
```

---

## Calcul de $\pi$

**arctan** : c'est la réciproque de $\tan$ restreinte à $]-\frac\pi2, \frac\pi2[$, définie sur $\mathbb{R}$ et à valeurs dans $]-\frac\pi2, \frac\pi2[$.
→ $\tan\frac\pi4 = 1$ et $\frac\pi4 \in\, ]-\frac\pi2, \frac\pi2[$, donc $\arctan 1 = \frac\pi4$.

**Série** (pour $x \in [0,1]$) : $\arctan x \approx \sum_{k=0}^{n-1}(-1)^k\dfrac{x^{2k+1}}{2k+1}$, avec une erreur $\le \dfrac{x^{2n+1}}{2n+1}$.

```python
def approx_arctan(x, n):         # x de type Rat (ou float)
    s, p, x2 = Rat(0), x, x * x  # p = x^(2k+1), recyclé
    for k in range(n):
        t = p * Rat(1, 2*k + 1)
        s = s + t if k % 2 == 0 else s - t
        p = p * x2
    return s

def rang_approx_arctan(x, delta):
    n = 0
    while x**(2*n + 1) / (2*n + 1) >= delta:
        n += 1
    return n
```

**Exemple** : 3 décimales de $\arctan 1$. Il faut $\frac{1}{2n+1} < 10^{-4}$, donc $2n+1 > 10^4$, soit $n = 5000$.

**Leibniz** : $\pi \approx 4\sum_{k=0}^{n-1}\frac{(-1)^k}{2k+1}$, avec une erreur $\le \frac{4}{2n+1}$.
→ Pour $d$ décimales, il faut $\frac{4}{2n+1} < 10^{-(d+1)}$, soit $n = 2\cdot10^{d+1}$. C'est une convergence **très lente**, exponentielle en $d$.
```python
def approx_pi_leibniz(n):
    return Rat(4) * approx_arctan(Rat(1), n)
```

**Formules trigonométriques**
- $\tan(a+b) = \dfrac{\tan a + \tan b}{1 - \tan a\tan b}$, $\quad \tan(a-b) = \dfrac{\tan a - \tan b}{1 + \tan a\tan b}$
- $\tan 2a = \dfrac{2\tan a}{1 - \tan^2 a}$

**Machin** : $A = \tan(2\arctan\frac15) = \frac{2/5}{1 - 1/25} = \frac{5}{12}$, puis $B = \tan(4\arctan\frac15) = \frac{2A}{1-A^2} = \frac{120}{119}$, puis $C = \tan(4\arctan\frac15 - \frac\pi4) = \frac{B-1}{1+B} = \frac{1}{239}$. On obtient :
$$\frac\pi4 = 4\arctan\frac15 - \arctan\frac1{239}$$
→ Convergence rapide car $x$ est petit : l'erreur décroît comme $(1/5)^{2n}$.

```python
def approx_pi_machin(n1, n2):
    return Rat(16) * approx_arctan(Rat(1, 5), n1) - Rat(4) * approx_arctan(Rat(1, 239), n2)
```

---

## Méthode de Newton

Pour résoudre $f(x) = 0$ : $\quad x_{k+1} = x_k - \dfrac{f(x_k)}{f'(x_k)}$

**Racine carrée**, avec $f(x) = x^2 - a$ et $f'(x) = 2x$ :
$$x_{k+1} = x_k - \frac{x_k^2 - a}{2x_k} = \frac12\left(x_k + \frac{a}{x_k}\right)$$

**Racine $n$-ième**, avec $f(x) = x^n - a$ et $f'(x) = nx^{n-1}$ :
$$x_{k+1} = x_k - \frac{x_k^n - a}{n x_k^{n-1}} = \frac{1}{n}\left((n-1)x_k + \frac{a}{x_k^{n-1}}\right)$$

**Convergence quadratique** : $x_{k+1} - \sqrt a = \dfrac{(x_k - \sqrt a)^2}{2x_k}$
- Donc $x_{k+1} \ge \sqrt a$ dès $k \ge 0$, et la suite est **décroissante** ($x_{k+1} - x_k = \frac{a - x_k^2}{2x_k} \le 0$), minorée, donc **convergente** vers $L$ tel que $L = \frac12(L + \frac aL)$, soit $L = \sqrt a$.
- Si $|x_k - \sqrt a| \le 10^{-n}$, alors $|x_{k+1} - \sqrt a| \le \dfrac{10^{-2n}}{2\sqrt a}$ : le **nombre de décimales correctes double** à chaque itération.

```python
def ceilsqrt(x):                 # plus petit entier n tel que n*n >= x
    n = 0
    while n * n < x:
        n += 1
    return n

def mysqrt(x):
    if x == 0:
        return 0.0
    xk = float(ceilsqrt(x))      # x0 >= sqrt(x)
    for _ in range(100):
        nxt = (xk + x / xk) / 2
        if abs(nxt - xk) < 2e-16 * abs(nxt):   # erreur relative
            return nxt
        xk = nxt
    return xk

def newton(f, fp, x0, eps=1e-15, itmax=100):
    x = x0
    for _ in range(itmax):
        nx = x - f(x) / fp(x)
        if abs(nx - x) < eps * abs(nx):
            return nx
        x = nx
    return x
```

**Erreur relative** : $\dfrac{|\text{valeur} - \text{référence}|}{|\text{référence}|}$
