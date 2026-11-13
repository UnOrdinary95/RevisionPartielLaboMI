# P1 · Mandelbrot & nombres complexes

#labo-mi #partiel

## Nombres complexes

**Forme algébrique** : $z = a + bi$, avec $a=\operatorname{Re}(z)$ et $b=\operatorname{Im}(z)$, et $i^2=-1$.
→ Partie réelle = abscisse, partie imaginaire = ordonnée du point.

**Somme** : $(a+bi)+(c+di) = (a+c) + (b+d)i$
**Produit** : $(a+bi)(c+di) = (ac-bd) + (ad+bc)i$
→ Moyen mnémotechnique : on développe et on remplace $i^2$ par $-1$.

**Carré** : $(a+bi)^2 = (a^2-b^2) + 2ab\,i$
→ Utile pour calculer $z_n^2$ à la main.

**Conjugué** : $\overline{a+bi} = a - bi$
- $\overline{z+w}=\bar z+\bar w$, $\quad\overline{zw}=\bar z\,\bar w$, $\quad\overline{z^2}=\bar z^{\,2}$
- $z\bar z = a^2+b^2 = |z|^2$
→ Sert à prouver la symétrie de $M$.

**Module** : $|z| = \sqrt{a^2+b^2}$
→ C'est la distance du point à l'origine : « la suite est bornée » veut dire que $|z_n|$ reste borné.
- $|zw| = |z|\,|w|$, donc $|z^2| = |z|^2$
- $|\bar z| = |z|$
- $|\operatorname{Re} z| \le |z|$ et $|\operatorname{Im} z| \le |z|$

**Inégalité triangulaire** : $|z+w| \le |z| + |w|$ → pour **majorer** (preuve du disque inclus dans $M$).

```python
z = complex(1, -2)      # ou 1 - 2j
z.real, z.imag          # 1.0, -2.0
abs(z)                  # module
z.conjugate()           # conjugué
```

> [!tip] Classe `Complexe` (annale du partiel 2025)
> ```python
> import math
> class Complexe:
>     def __init__(self, re, im):
>         self.re = re
>         self.im = im
>     def __repr__(self):
>         return f"Complexe({self.re}, {self.im})"
>     def __add__(self, other):
>         return Complexe(self.re + other.re, self.im + other.im)
>     def __mul__(self, other):
>         return Complexe(self.re*other.re - self.im*other.im,
>                         self.re*other.im + self.im*other.re)
>     def module(self):
>         return math.sqrt(self.re**2 + self.im**2)
> ```
> Variantes possibles : `__sub__`, `conjugue` → `Complexe(self.re, -self.im)`, `__eq__`, `__neg__`.

---

## Suite de Mandelbrot

$$z_0 = 0, \qquad z_{n+1} = z_n^2 + c$$

**Ensemble de Mandelbrot** : $M = \{c \in \mathbb{C} \text{ tels que } (z_n) \text{ est bornée}\}$.

**Calcul à la main** (exemple $c = 1+i$) :
$z_1 = c = 1+i$, puis $z_2 = (1+i)^2 + c = 2i + 1 + i = 1+3i$, puis $z_3 = (1+3i)^2 + c = -8+6i+1+i = -7+7i$.
→ On a toujours $z_1 = c$.

**Critère d'échappement** : si un terme vérifie $|z_k| > 2$, alors $|z_n| \to +\infty$. Donc $c \notin M$.

**Algorithme `dansM`** : on itère jusqu'à `rang`. Si $|z|>2$, on renvoie `False` ; sinon `True` à la fin.

```python
def suite(n, c):
    z = 0
    for _ in range(n):
        z = z*z + c
    return z

def dansM(c, rang):
    z = 0
    for _ in range(rang):
        z = z*z + c
        if abs(z) > 2:
            return False
    return True

def rang_echap(c, rang):
    z = 0
    for k in range(1, rang + 1):
        z = z*z + c
        if abs(z) > 2:
            return k
    return None
```

> [!warning] Efficacité
> Appeler `suite(k, c)` pour $k = 1..n$ recalcule tout à chaque fois : $1+2+\dots+n = \frac{n(n+1)}{2}$ itérations. Une seule boucle n'en coûte que $n$.

---

## Propriétés géométriques

**Disque inclus** : si $|c| \le \frac14$, alors $|z_n| \le \frac12$ pour tout $n$ (récurrence : $|z_{n+1}| \le |z_n|^2 + |c| \le \frac14 + \frac14$). Le disque $D(0, \frac14)$ est donc inclus dans $M$.

**Symétries**
| Propriété | Symétrie |
|---|---|
| $c \in M \Rightarrow \bar c \in M$ | axiale, par rapport à l'axe **réel** ✅ (celle de $M$) |
| $c \in M \Rightarrow -c \in M$ | centrale, par rapport à $O$ |
| $c \in M \Rightarrow -\bar c \in M$ | axiale, par rapport à l'axe **imaginaire** |

**Preuve de la symétrie de $M$** : par récurrence, $w_n = \overline{z_n}$ (car $\overline{z^2 + c} = \bar z^{\,2} + \bar c$), donc $|w_n| = |z_n|$.

**Cardioïde** : on pose $w = z - \frac14$, $\rho = |w|$ et $\theta$ l'angle de $w$ ; $z$ est à l'intérieur si $\rho \le \frac12(1-\cos\theta)$.
→ L'angle s'obtient avec `math.atan2(w.imag, w.real)` (**y d'abord**).

```python
import math
def dans_cardioide(z):
    w = z - 1/4
    theta = math.atan2(w.imag, w.real)
    return abs(w) <= (1 - math.cos(theta)) / 2
```

## Rédiger une récurrence (squelette)

> [!tip] Modèle
> **Énoncé** $P_n$ : « $|z_n| \le \frac12$ ».
> **Initialisation** : $z_0 = 0$, donc $P_0$ est vraie.
> **Hérédité** : soit $n \in \mathbb{N}$, on suppose $P_n$. Alors $|z_{n+1}| \le |z_n|^2 + |c| \le \dots$, donc $P_{n+1}$.
> **Conclusion** : $P_n$ est vraie pour tout $n \in \mathbb{N}$.
