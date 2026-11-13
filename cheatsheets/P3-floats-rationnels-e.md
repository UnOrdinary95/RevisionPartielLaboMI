# P3 · Floats, rationnels et calcul de $e$

#labo-mi #partiel

## Nombres à virgule flottante (`float`)

**Format IEEE 754, 64 bits** : $\pm\, m \times 2^{e}$, avec 1 bit de signe, 11 bits d'exposant et 52 bits de mantisse (53 avec le bit implicite).
→ Environ **15 à 16 chiffres significatifs** ($2^{-52} \approx 2{,}2\cdot10^{-16}$). C'est pourquoi `math.pi` et `math.e` n'ont que 15 décimales.

**Exactement représentables** : les nombres de la forme $\dfrac{k}{2^n}$, dont le développement binaire est fini.
- $0{,}25 = \frac14 = 0{,}01_2$ est exact.
- $0{,}2 = \frac15$ donne $0{,}0011\,0011\dots_2$, infini, donc **arrondi**.
- `0.1 + 0.2 != 0.3` : les trois nombres sont arrondis, et les erreurs ne se compensent pas.

> [!warning] Comparer deux floats
> Jamais `==` sur un résultat de calcul : utiliser `math.isclose(x, y)` ou `abs(x - y) < eps`.

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

**`Rat` contre `float`** : `Rat` est **exact** mais lent (numérateurs et dénominateurs géants). `float` est rapide mais limité à environ 16 chiffres.

---

## Calcul de $e$

**Approximation** : $e \approx \sum_{k=0}^{n}\frac1{k!}$, avec une erreur $\le \dfrac{3}{(n+1)!}$ (donnée dans l'énoncé).
→ Pour $d$ décimales correctes, il faut une erreur $< 10^{-(d+1)}$.

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

## Racine carrée entière

```python
def ceilsqrt(x):                 # plus petit entier n tel que n*n >= x (sans sqrt)
    n = 0
    while n * n < x:
        n += 1
    return n
```
