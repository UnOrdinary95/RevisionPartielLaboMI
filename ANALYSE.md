# Analyse : partiel Labo Math-Info (vendredi 13/11, 1h, sur papier)

Programme : **Pb1** Mandelbrot (complexes), **Pb2** Polynômes, **Pb3** Représentation des nombres, calcul de $e$, $\pi$ et $\sqrt{a}$ (floats, classe `Rat`, séries, Newton).

Fiches associées : [[P1-Mandelbrot-complexes]] · [[P2-Polynomes]] · [[P3-floats-rationnels-e]]

---

## 1. Les annales

| Année | Épreuve | Exercices | Problème d'origine |
|---|---|---|---|
| 2025-26 | **Partiel 1h** | Ex1 : classe `Complexe` (`__init__`, `__repr__`, `__add__`, `__mul__`, `module`) | Pb1 Mandelbrot |
| | | Ex2 : $1+\frac1{2!}+\dots+\frac1{20!}$ en `float`, **efficacement**, sans `factorial` | Pb « calcul de $e$ » |
| | | Ex3 : inverse modulaire (à la main, `invmod` force brute, preuve, `invmod2` avec Bézout et `gcd`) | Pb2 Crypto |
| 2025-26 | Final 2h | Ex1 : $P\times Q$, $P+R$, degrés, classe `Poly` (init sans 0 finaux, repr, degre, derive, eval, add, mul) | Polynômes |
| | | Ex2 : vignettes (dénombrement, probas, `randint`) | Probabilités |
| | | Ex3 : suite $x_{k+1}=(ax_k+b)\bmod 256$ (code, pigeonnier, récurrence sur la parité) | Crypto |
| 2024-25 | Final 2h | Ex1 : classe `Rat` (irréductible, dénominateur 1 par défaut, repr/str/add/mul) | Calcul de $e$ / rationnels |
| | | Ex2 : diamètre d'un nuage de points (compter les appels, **valeur exacte**) | Algorithmique |
| | | Ex3 : permutations (inversions, signature, transpositions) | Probas / poker |

> [!important] Factorielle
> L'exercice $\sum 1/k!$ du partiel 2025 vient bien d'un TP. C'est le **Pb3 B.1.3 `approx_e`** de cette année, avec l'indication « quand on a déjà calculé $k!$, il est facile de calculer $(k+1)!$ ». La règle « un exercice par problème » est donc confirmée.

> [!warning] Inverse modulaire / Bézout
> Ces notions viennent du problème Crypto, qui n'est pas dans nos 3 problèmes. **Exclues du partiel.**

---

## 2. Le format type d'un partiel d'1h

- **3 exercices, 1 par problème**, environ 20 minutes chacun.
- **1 classe** avec 4 ou 5 méthodes : `__init__`, `__repr__`, `__add__`, `__mul__`, plus une méthode métier (`module`, `degre`, `derive`, `eval`…). L'énoncé la décrit par des **doctests**, qu'il faut reproduire exactement (format de `__repr__` compris).
- **1 fonction courte « efficace »** : calcul incrémental, sans recalcul. On recycle $k!$, $x^k$ ou $z_n$.
- **Des maths niveau TP** : calcul à la main « sans justifier », petite preuve (équivalence, récurrence de 3 lignes), comptage exact d'opérations ou d'appels.
- **Ne tombe jamais** : graphiques matplotlib, observations expérimentales (timing, « conjecturer en traçant »), preuves longues en plusieurs étapes, recherche internet.

---

## 3. Révision du 13/11 : ce qu'on écarte

Critères : en **1h**, il faut des **automatismes**. Chaque question doit **avoir un sens toute seule** (3 ou 4 questions au total, pas plusieurs exercices sur le même sujet), et certains TP datent d'un mois. Ces éléments sont donc jugés improbables et **masqués sur la plateforme** (passés en ★) :

| Problème | Écarté | Pourquoi |
|---|---|---|
| P1 | `dansJ`, symétrie de Julia | Le sujet, c'est Mandelbrot ; Julia est une extension |
| P1 | Appartenance à $M$ pour $c=-1,-2,1,\frac14$ | Trop long (4 suites à dérouler) |
| P1 | Limite de l'algorithme d'appartenance | N'a pas de sens isolément |
| P1 | Justifier $M\subset D$ | N'a pas de sens isolément |
| P1 | Minoration $\lvert z_{n+1}\rvert\ge\lvert z_n\rvert^2-\lvert c\rvert$ | Trop poussé pour 1h |
| P1 | `argument(z)` avec `atan2` | Ne sert qu'à l'accélération par la cardioïde : question faible isolément |
| P2 | Pourquoi retirer les 0 finaux | Improbable |
| P2 | Énoncé du TVI | Improbable |
| P3 | Tout Newton : `mysqrt`, `nthroot`, Newton générique, récurrences, vitesse, erreur | Tiré par les cheveux sur papier |
| P3 | Tout `arctan` : `approx_arctan` (float et `Rat`), rangs, $\arctan 1=\frac\pi4$ | Improbable |
| P3 | Leibniz (code et erreur), $\tan(2\arctan\frac15)$, Machin | Improbable (calculatrice sans doute interdite) |
| P3 | `mat_inversible` et le déterminant flottant | Improbable |
| P3 | Comparer deux fractions sans division (question de maths) | Improbable |
| P3 | Taylor-Lagrange pour $e$ | Trop long pour 1h |

**Ce qui reste en jeu** (53 exercices) :
- **P1** : les classes `Complexe`, `suite`, `dansM`, `rang_echap`, `dans_cardioide`, les termes à la main, les calculs sur les complexes, le coût de `dansM`, les récurrences (disque, conjugué), les symétries.
- **P2** : toute la classe `Poly`, Horner (code, à la main, coût), `derive`, `compose`, la dichotomie, les degrés de la somme, du produit et de la composée.
- **P3** : $\sum\frac1{k!}$, `rang_approx_e`, `approx_e`, la classe `Rat` (opérations, comparaisons), `pgcd`, `ceilsqrt`, la somme $\frac1{k^4}$ en ordre inverse, les fractions irréductibles et les floats (0.2 contre 0.25).

> [!note]
> Les verdicts de la section suivante sont ceux de l'analyse initiale : en cas de désaccord, c'est ce tableau qui prime.

---

## 4. Inventaire complet de ce qui peut tomber

★★★ très probable · ★★ probable · ★ possible · ✗ écarté (raison indiquée). **C** = code, **M** = maths.

### Problème 1 : Mandelbrot / complexes

| § | Élément | Type | Verdict |
|---|---|---|---|
| annale | Classe `Complexe` : init, repr, add, mul, module | C | ★★★ |
| variante | `Complexe` : `__sub__`, `conjugue`, `__eq__`, `__neg__`, `__str__` au format `3-i` | C | ★★ |
| variante | `suite_mandel(n, c)` avec **sa propre** classe `Complexe`, sans `complex` | C | ★★ |
| A | $z_1, z_2, z_3$ à la main pour un $c$ donné ($1+i$, $i$, $-1$, $-2$, $\frac12$…) | M | ★★★ |
| A | `suite(n, c)` : terme de rang $n$ | C | ★★★ |
| A | $c\in M$ ? à la main pour des cas à cycle ($c=-1$, $c=i$, $c=-2$) ou divergents ($c=1$) | M | ★★ |
| B | Dans quel cas l'algorithme se trompe-t-il ? | M | ★★ |
| B | `dansM(c, rang)` **sans rappeler `suite`** | C | ★★★ |
| B | Comptage exact : `suite(k)` pour $k=1..n$ coûte $\frac{n(n+1)}2$ itérations, contre $n$ pour `dansM` | M | ★★ |
| C | Justifier $M\subset D$ | M | ★★ |
| C | `trace_grille`, `trace_disque`, `traceM` | C | ✗ graphique matplotlib |
| C | Sans graphique : `linspace` maison, `grille(n)`, `points_dans_M(n, rang)` | C | ★ |
| D.1 | Récurrence : $\lvert c\rvert \le\frac14 \Rightarrow \lvert z_n\rvert \le\frac12$, d'où le disque inclus dans $M$ | M | ★★ |
| D.2 | Associer $\bar c$, $-c$, $-\bar c$ à leur symétrie | M | ★★ |
| D.3 | Re et Im de $f(\theta)=\frac14+\frac12(1-\cos\theta)e^{i\theta}$ | M | ★ |
| D.3 | Tracé de la cardioïde, « justifier le nom » | — | ✗ graphique, anecdotique |
| E | Expliquer les accélérations (disque $\frac14$, symétrie donc demi-grille) | M | ★ |
| E | `traceM_acc` complet | C | ✗ long et graphique |
| E | `argument(z)` avec `atan2` | C | ★★ |
| E | `dans_cardioide(z)` | C | ★★ |
| F | `rang_echap(c, rang)` : rang ou `None` | C | ★★★ |
| F | `traceM_echap` (scatter) | C | ✗ graphique |
| G.1 | Récurrence $w_n=\overline{z_n}$, puis $\lvert w_n\rvert =\lvert z_n\rvert$, puis $c\in M\Rightarrow\bar c\in M$ | M | ★★ |
| G.2.1 | $\lvert z_{n+1}\rvert \ge\lvert z_n\rvert ^2-\lvert c\rvert$ | M | ★★ |
| G.2.2 a | $\lvert c\rvert >2\Rightarrow\lvert z_n\rvert \ge\lvert c\rvert$ (récurrence) | M | ★ |
| G.2.2 b–d, G.2.3 | Minoration géométrique et limite infinie | M | ✗ trop long pour 1h (4 étapes enchaînées) |
| H | `dansJ(alpha, c, rang)` (Julia, $z_0=\alpha$) | C | ★★ |
| H | Symétrie centrale de $J_c$ ($\alpha$ et $-\alpha$ donnent le même $z_1$) | M | ★ |
| H | `traceJ`, conjecture de connexité | — | ✗ graphique / observation |

### Problème 2 : Polynômes

| § | Élément | Type | Verdict |
|---|---|---|---|
| A | $P+Q$, $P+R$, $P\times Q$ (repris tel quel au final 2025) et variantes | M | ★★★ |
| A | Tableau de valeurs $P(x)$ pour $x\in\{-1,0,1,2\}$ | M | ★★ |
| annale | Classe `Poly` : init sans 0 finaux, repr, degre, derive, eval, add, mul | C | ★★★ |
| B1 | Pourquoi les 0 finaux sont une mauvaise idée | M | ★★ |
| B3 | `degre` (polynôme nul : $-1$) | C | ★★★ |
| B4 | `eval` | C | ★★★ |
| B5 | Coefficients de $A+B$, $\deg\le\max$, contre-exemple | M | ★★★ |
| B5 | `__add__` **sans modifier `self` ni `other`** | C | ★★★ |
| B6 | Coefficients du produit $\sum_{i+j=k}a_ib_j$, $\deg(AB)=\deg A+\deg B$ | M | ★★★ |
| B6 | `__mul__` (double boucle) | C | ★★★ |
| B6 | `__radd__`, `__rmul__`, constantes `int` | C | ★ |
| B7 | `__neg__`, `__sub__` en une ligne | C | ★★ |
| B8 | `__eq__` en une ligne | C | ★★ |
| B9 | `__str__` (signes, $\pm1$, $X^0$, $X^1$) | C | ★ (long et piégeux) |
| C1 | Comptage exact de l'`eval` naïf : $d$ additions, $\frac{d(d+1)}2$ multiplications | M | ★★★ |
| C1 | Timing, commentaire des mesures | — | ✗ expérimental |
| C2 | `evalFast` et son coût : $2d$ multiplications, $d$ additions | C+M | ★★ |
| C3 | Horner à la main | M | ★★★ |
| C3 | `evalHorner` itératif ou récursif | C | ★★★ |
| C3 | Coût de Horner : $d$ multiplications, $d$ additions | M | ★★★ |
| C3 | Pourquoi $P_n(3)$ coûte plus que linéairement (entiers géants) | M | ★ |
| D1 | Coefficients et degré de $A'$ | M | ★★★ |
| D1 | `derive` | C | ★★★ |
| D2 | $\deg(A\circ B)=de$, non-commutativité | M | ★★ |
| D2 | `compose` | C | ★★ |
| E | Énoncé du TVI | M | ★★ |
| E | Preuve de la borne $\lvert r\rvert \le\max(s/\lvert a_d\rvert ,1)$ | M | ★ |
| E | `borne_racines(P)` | C | ★ |
| E | Racine entre deux racines consécutives de $A'$ : signes et unicité | M | ★ |
| E | `dichotomie(P, a, b, eps)` | C | ★★ |
| E | `findRoots` complet | C | ✗ trop long (récursion, bornes, dichotomie) |
| variante | `Poly` à partir des racines : $\prod(X-r_i)$ | C | ★ |

### Problème 3 : floats, `Rat`, $e$, $\pi$, racines

| § | Élément | Type | Verdict |
|---|---|---|---|
| A.1 Q1 | Pourquoi environ 15–16 décimales | M | ★★ |
| A.1 Q2 | $0.25$ exact mais pas $0.2$ ; `0.1 + 0.2 != 0.3` | M | ★★★ |
| A.1 Q3 | `mat_inversible` faux, puis correction avec tolérance | M+C | ★★ |
| A.1 Q4 | $\sum 1/k^4$ qui stagne (absorption) | M | ★★ |
| A.1 Q4 | Sommer en ordre inverse | C | ★★ |
| A.2.1 | Forme irréductible à la main | M | ★★★ |
| A.2.1 | Procédure (pgcd, signe au numérateur) | M | ★★ |
| A.2.1 | `pgcd` par Euclide | C | ★★ |
| A.2.1 | Unicité par le lemme de Gauss | M | ★ (preuve guidée) |
| annale | Classe `Rat` : init irréductible, dénominateur 1 par défaut, repr, str, add, mul | C | ★★★ |
| A.2.2 | Formules de $x+y$, $xy$, $x/y$ | M | ★★★ |
| A.2.2 | `__sub__`, `__neg__`, `__truediv__` | C | ★★ |
| A.2.2 | Comparaison par produit en croix | M | ★★ |
| A.2.2 | `__eq__`, `__lt__`, `__le__` | C | ★★ |
| A.2.2 Q4 | `to_dec_string(n)` | C | ★ (piège du signe) |
| A.2.2 Q5 | $\sum 1/k^4$ avec `Rat` | C | ★ |
| annale | $\sum_{k=1}^{20}1/k!$, efficace, sans `factorial` | C | ★★★ |
| B.1.1 | Taylor-Lagrange de $\exp$ en $0$, $x=1$ | M | ★★ |
| B.1.1 | Erreur $\le\frac{e}{(n+1)!}\le\frac3{(n+1)!}$ | M | ★★ |
| B.1.2 | `rang_approx_e(delta)` **sans `factorial`** | C | ★★★ |
| B.1.3 | `approx_e(n)` en `Rat` ou en float | C | ★★★ |
| B.1.3 | Comptage des opérations d'`approx_e` | M | ★★ |
| B.3.1 | Définition d'$\arctan$, $\arctan 1=\pi/4$ | M | ★★ |
| B.3.1 | `rang_approx_arctan(x, delta)` | C | ★★ |
| B.3.1 | Rang à la main pour 3 décimales de $\arctan 1$ ($n=5000$) | M | ★★ |
| B.3.1 | `approx_arctan(x, n)` | C | ★★★ |
| B.3.2 | Erreur de Leibniz $\frac4{2n+1}$, $n=2\cdot10^{d+1}$ | M | ★★ |
| B.3.2 | `approx_pi_leibniz(n)` | C | ★★ |
| B.3.3 | $\tan(2\arctan\frac15)=\frac5{12}$ | M | ★★ |
| B.3.3 | $B=\frac{120}{119}$, $C=\frac1{239}$, formule de Machin | M | ★ (enchaînement long) |
| B.3.3 | `approx_pi_machin(n1, n2)` avec `approx_arctan` fournie | C | ★ |
| B.3.3 | `approx_machin(d)` complet, 1000 décimales, record | — | ✗ long / culture générale |
| C | Récurrence de Newton pour $x^2-a$ | M | ★★★ |
| C | Récurrence de Newton pour $x^n-a$ | M | ★★ |
| C.1 | `ceilsqrt` sans `sqrt` | C | ★★★ |
| C.1 | `mysqrt` (Newton, critère relatif $2\cdot10^{-16}$, 100 itérations max) | C | ★★★ |
| C.1 | Erreur relative entre `mysqrt` et `math.sqrt` | C | ★ |
| C.1 | Convergence quadratique : les décimales correctes doublent | M | ★★ |
| C.2 | `nthroot(a, n)` | C | ★★ |
| variante | `newton(f, fp, x0, eps, itmax)` générique | C | ★★ |
| C.3 | $x_k>0$ ; $x_{k+1}-\sqrt a=\frac{(x_k-\sqrt a)^2}{2x_k}$ | M | ★★ |
| C.3 | $x_k\ge\sqrt a$, décroissance, convergence | M | ★ |
| C.3 | $\lvert x_k-\sqrt a\rvert \le10^{-n}\Rightarrow\lvert x_{k+1}-\sqrt a\rvert \le\frac{10^{-2n}}{2\sqrt a}$ | M | ★★ |

### Pronostic de sujet

1. **Une classe** (quasi certain) : `Poly` ou `Rat` en priorité, `Complexe` toujours possible (même Pb1 que l'an dernier).
2. **Pb1** : `suite`, `dansM`, `rang_echap`, ou $z_1..z_3$ à la main.
3. **Pb3** : une fonction efficace ($\sum1/k!$, `approx_e`, `rang_approx_e`, `approx_arctan`, `ceilsqrt` / `mysqrt`), ou une question de floats / de fractions.
4. **Pb2** (s'il ne sort pas en classe) : $P+Q$, $P\times Q$, degrés, `derive`, `evalHorner`, comptage d'opérations.

---

## 5. À savoir écrire les yeux fermés

- [ ] Classe `Complexe` : `__init__`, `__repr__`, `__add__`, `__mul__`, `module`
- [ ] Classe `Poly` : `__init__` (sans 0 finaux), `__repr__`, `degre`, `eval`, `derive`, `__add__`, `__mul__`
- [ ] Classe `Rat` : `__init__` irréductible avec dénominateur 1 par défaut, `__repr__`, `__str__`, `__add__`, `__mul__`
- [ ] `suite(n, c)`, `dansM(c, rang)`, `rang_echap(c, rang)`
- [ ] `evalHorner`, `derive`
- [ ] $\sum_{k=1}^{20}1/k!$ avec factorielle incrémentale
- [ ] `approx_e(n)`, `rang_approx_e(delta)` sans `factorial`
- [ ] `ceilsqrt(x)`, `pgcd(a, b)` (Euclide)
- [ ] À la main : $z_1..z_3$, $P\times Q$, Horner, fraction irréductible, opérations sur les fractions

---

## 6. Pièges relevés dans tes rendus

- **Pb2 `__add__`** : tu ajoutes des 0 à `self.coeff` et `other.coeff`, puis tu les retires. C'est un effet de bord : une opération `+` ne doit jamais modifier ses opérandes. Il faut créer une nouvelle liste.
- **Pb2 C1** : `sum` n'est pas « quasi constant ». Il est lui aussi linéaire, mais codé en C, donc beaucoup plus rapide.
- **Pb2 D1** : la dérivée d'une constante est le polynôme nul, de degré **$-1$** par convention. Ce n'est pas un polynôme « sans degré ».
- **Pb2 C1, coût de `eval`** : $\frac{d(d-1)}2+d=\frac{d(d+1)}2$ multiplications. Le résultat est juste, mais il suppose un `pow` naïf : précise-le sur la copie.
- **Pb3 A.1 Q4** : ta réponse est juste, sache la justifier. Les deux ordres de sommation diffèrent dès $n=100$, mais seulement sur les 1 à 2 derniers chiffres (erreurs d'arrondi cumulées). La **stagnation** vient d'ailleurs : dès $k\approx10^4$, on a $1/k^4<10^{-16}$, soit moins de la moitié de l'écart entre deux floats voisins de $1{,}08$, et le terme est absorbé. C'est pourquoi $n=10^4$ et $n=10^5$ donnent exactement le même résultat.
- **Pb3 `rang_approx_e`** : tu utilises `factorial`. À l'examen, ce sera interdit : il faut une factorielle incrémentale.
- **Pb3 `Rat.__init__`** : ne pas oublier le signe (dénominateur toujours $>0$) ni le dénominateur par défaut `=1`.
- **Doctests** : `__repr__` doit reproduire le format exact, par exemple `Complexe(3, -1)` avec une espace après la virgule, ou `Rat(3, 2)`.

---

## 7. Stratégie de copie (1h)

1. **Lire tout le sujet** (2 min), puis commencer par la **classe**, la plus rentable et la plus mécanique (~20 min).
2. Faire les **calculs à la main** « sans justifier » tout de suite : points rapides.
3. Ensuite, la fonction « efficace » : écrire d'abord la boucle avec l'**accumulateur recyclé** (`fact *= k`, `p *= x`, `z = z*z + c`).
4. Garder 5 minutes pour relire les **doctests** : format de `__repr__`, cas limites (polynôme nul, dénominateur négatif, `None`).
5. Une preuve bloque ? Écris la structure (initialisation, hérédité, conclusion) et l'inégalité clé : elle rapporte des points partiels.
