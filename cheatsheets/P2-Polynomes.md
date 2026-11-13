# P2 · Polynômes

#labo-mi #partiel

## Représentation

$P(X) = \sum_{k=0}^{d} a_k X^k$ est représenté par la liste `[a0, a1, ..., ad]`, **du degré 0 au degré max**.
→ $5X^3 - 2X^2 + 1$ donne `[1, 0, -2, 5]`. Le polynôme nul est `[]`.

**Pas de 0 final** : le constructeur retire les 0 de fin (`[2, 5, 0]` devient `[2, 5]`).

**Degré** : indice du dernier coefficient non nul. Par convention, $\deg 0 = -1$.

---

## Opérations

**Somme** : $(A+B)_k = a_k + b_k$, en complétant le plus court par des 0.
→ $\deg(A+B) \le \max(\deg A, \deg B)$, avec égalité si les degrés sont différents.
→ Contre-exemple : $(X+1) + (-X+1) = 2$, le terme dominant s'annule.

**Produit** : $(AB)_k = \sum_{i+j=k} a_i b_j$
→ $\deg(AB) = \deg A + \deg B$ si $A, B \ne 0$, car $a_d b_e \ne 0$.

**Dérivée** : $a_k X^k \to k\,a_k X^{k-1}$. La liste `[a0, a1, ..., ad]` devient `[1*a1, 2*a2, ..., d*ad]`.
→ $\deg A' = \deg A - 1$ si $\deg A \ge 1$. Si $A$ est constant, $A' = 0$, de degré $-1$.

**Composée** : $A(B(X)) = \sum a_k B(X)^k$, de degré $\deg A \times \deg B$.
→ Elle n'est **pas commutative** : avec $A = X^2$ et $B = X+1$, $A\circ B = X^2+2X+1$ mais $B\circ A = X^2+1$.

> [!example] Annale (final 2025) : $P = X^3 - X$, $Q = 2X^2+X+1$, $R = -X^3+X^2+3$
> - $P+Q = X^3 + 2X^2 + 1$ (degré 3)
> - $P+R = X^2 - X + 3$ (degré 2 : $X^3$ s'annule)
> - $P\times Q = 2X^5 + X^4 - X^3 - X^2 - X$ (degré $3+2 = 5$)

---

## Évaluation : comptage des opérations (degré $d$)

| Méthode | Idée | Multiplications | Additions |
|---|---|---|---|
| naïve `eval` | recalcule $x^k$ ($k-1$ mult.) puis $\times a_k$ | $\frac{d(d+1)}{2}$ | $d$ |
| `evalFast` | recycle $x^k = x^{k-1}\cdot x$ | $2d$ | $d$ |
| **Horner** | $a_0 + x(a_1 + x(a_2 + \dots))$ | $d$ | $d$ |

→ Naïf : $\sum_{k=1}^{d} k = \frac{d(d+1)}{2}$.

**Horner à la main** : $P = 1 + 2X + 3X^2$, avec $x = 2$
$3 \;\to\; 2 + 3\cdot2 = 8 \;\to\; 1 + 8\cdot2 = 17$. Donc $P(2) = 17$.
→ On part du coefficient de **plus haut degré** et on répète « × x, + coefficient suivant ».

---

## Classe `Poly` (annale du final 2025)

```python
class Poly:
    def __init__(self, coeff):
        self.coeff = list(coeff)               # copie !
        while self.coeff and self.coeff[-1] == 0:
            self.coeff.pop()

    def __repr__(self):
        return f"Poly({self.coeff})"

    def degre(self):
        return len(self.coeff) - 1             # [] → -1

    def eval(self, x):                         # Horner
        r = 0
        for a in reversed(self.coeff):
            r = r * x + a
        return r

    def derive(self):
        return Poly([k * self.coeff[k] for k in range(1, len(self.coeff))])

    def __add__(self, other):
        n = max(len(self.coeff), len(other.coeff))
        a = self.coeff + [0] * (n - len(self.coeff))    # nouvelles listes
        b = other.coeff + [0] * (n - len(other.coeff))
        return Poly([a[k] + b[k] for k in range(n)])

    def __mul__(self, other):
        if not self.coeff or not other.coeff:
            return Poly([])
        r = [0] * (len(self.coeff) + len(other.coeff) - 1)
        for i, a in enumerate(self.coeff):
            for j, b in enumerate(other.coeff):
                r[i + j] += a * b
        return Poly(r)
```

> [!warning] Pièges
> - `__add__` ne doit **jamais modifier** `self.coeff` ni `other.coeff`. On crée de nouvelles listes.
> - Le tableau de `__mul__` est de taille $d + e + 1$, soit `len(self.coeff) + len(other.coeff) - 1`.
> - Le constructeur `Poly(...)` nettoie les 0 finaux du résultat : toujours renvoyer `Poly(liste)`.

**Une ligne chacune** :
```python
def __neg__(self):        return Poly([-a for a in self.coeff])
def __sub__(self, other): return self + (-other)
def __eq__(self, other):  return self.coeff == other.coeff
def compose(self, other):                  # Horner sur des polynômes
    r = Poly([])
    for a in reversed(self.coeff):
        r = r * other + Poly([a])
    return r
```

**`__repr__`** : c'est l'affichage console, au format exact des doctests (`Poly([1, 2])`).

---

## Racines

**Dichotomie** : si $P(a)$ et $P(b)$ sont de signes opposés, une racine est dans $[a, b]$. On coupe en $m = \frac{a+b}2$ et on garde la moitié où le signe change, ce qui fait $\log_2\frac{b-a}{\varepsilon}$ étapes.

```python
def dichotomie(P, a, b, eps):
    while b - a > eps:
        m = (a + b) / 2
        if P.eval(a) * P.eval(m) <= 0:
            b = m
        else:
            a = m
    return (a + b) / 2
```
