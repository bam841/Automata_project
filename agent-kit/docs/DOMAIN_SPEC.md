# Domain Specification — authoritative theory facts

Use this file for **every** theory statement in lessons, quizzes, the exam, and tests. If a
fact you need is missing, write `UNKNOWN` and ask; do not fill it from memory.
Golden values in §7 were **computed by script and verified** when this kit was written.

## 1. Strings (over an alphabet Σ)
- **Alphabet Σ**: a finite, non-empty set of symbols. Binary alphabet: Σ = {0,1}.
- **String**: a finite sequence of symbols from Σ. **Length |w|**: number of symbols.
- **Empty string ε**: the string of length 0. |ε| = 0. For any w: wε = εw = w.
- **Concatenation** wv: w followed by v. |wv| = |w| + |v|. Not commutative in general.
- **Reverse** w^R: symbols in opposite order. (w^R)^R = w. (wv)^R = v^R w^R. ε^R = ε.
- **Prefix / suffix**: if w = xy then x is a prefix and y is a suffix. ε and w itself are both a prefix and a suffix of w. A **proper** prefix/suffix is not equal to w.
- A string of length n has exactly **n+1 prefixes** and **n+1 suffixes** (cut position k = 0..n), all distinct as strings because their lengths differ.
- **Palindrome**: w = w^R. ε and every single symbol are palindromes. (The *game challenge* additionally requires length ≥ 3.)
- **Σ^n** has |Σ|^n strings. For binary: 2^n. All binary strings of length 0..6: 2^0+…+2^6 = **127**.
- Don't confuse: ε (a string) vs ∅ (the empty set) vs {ε} (a set containing the empty string).

## 2. Sets (universe U = {1,…,8})
- **Union** A ∪ B: elements in A or B (or both). **Intersection** A ∩ B: in both.
- **Difference** A \ B: in A but not in B. **Not symmetric**: A \ B ≠ B \ A in general.
- **Symmetric difference** A Δ B = (A \ B) ∪ (B \ A) = (A ∪ B) \ (A ∩ B): in exactly one of A, B.
- **Complement** A′ = U \ A (always relative to the universe).
- **Power set** 𝒫(A): the set of all subsets of A, **including ∅ and A itself**. |𝒫(A)| = 2^|A|. 𝒫(∅) = {∅} (size 1).
- **Cartesian product** A × B: ordered pairs (a,b), a∈A, b∈B. |A×B| = |A|·|B|. Not commutative in general; empty if A or B is empty.
- Identities: |A∪B| = |A| + |B| − |A∩B|; De Morgan: (A∪B)′ = A′ ∩ B′ and (A∩B)′ = A′ ∪ B′.
- Venn regions for two sets: only A, only B, both, neither (4 regions).
- **Set Park challenge** (A Δ B = {1,2,7,8} and A ∩ B = {4}): then A ∪ B = {1,2,4,7,8}; 4 is in both; each of 1,2,7,8 is in exactly one; 3,5,6 are in neither. There are **16** valid (A,B) pairs (each of 1,2,7,8 goes to A or to B).

## 3. Binary trees and traversals
- **Binary tree**: each node has at most two children, *left* and *right*. **Root**: no parent. **Leaf**: no children. **Subtree**: a node and all its descendants. **Height**: edges on the longest root-to-leaf path (a single node has height 0 — state the convention if you show height).
- **BST (binary search tree)** with distinct keys: all keys in the left subtree < node < all keys in the right subtree. Insertion: compare, go left if smaller, right if larger.
- **Preorder (NLR)**: node, left, right. **Inorder (LNR)**: left, node, right. **Postorder (LRN)**: left, right, node.
- On a BST, **inorder visits keys in ascending order** (use as a test invariant). This is *not* true for arbitrary binary trees.
- All three are depth-first and run in O(n). The recursion depth is at most height + 1.
- Level-order (BFS) is **out of scope**.

## 4. DFA
- **DFA** M = (Q, Σ, δ, q0, F): finite set of states Q; alphabet Σ; **transition function δ: Q × Σ → Q** (a *total* function: every state has exactly one transition on every symbol); start state q0 ∈ Q; accepting states F ⊆ Q.
- **Run** on w = a1…an: q = q0, then q = δ(q, ai) for each symbol. **Accept iff the final state ∈ F** (after reading the *entire* input). ε is accepted iff q0 ∈ F.
- **Language** L(M) = set of accepted strings.
- **Complement** machine: same Q, δ, q0 with accepting set Q \ F. Valid *because δ is total*. L(M̄) = Σ* \ L(M).
- Project limits: binary alphabet, **2–5 states**, q0 = state 0.

### Reference DFAs (state 0 is the start; `delta[state] = [next on 0, next on 1]`)
| Goal | delta | accept | Meaning of states |
|---|---|---|---|
| ends in `01` | `[[1,0],[1,2],[1,0]]` | `{2}` | 0: no progress/last was 1 · 1: last was 0 · 2: last two were 01 |
| even number of 1s | `[[0,1],[1,0]]` | `{0}` | 0: even · 1: odd |
| no two 0s in a row | `[[1,0],[2,0],[2,2]]` | `{0,1}` | 0: last not 0 · 1: last was 0 · 2: dead (saw 00) |

### Goal predicates (used by the test engine)
`endsWith01: s.endsWith('01')` · `evenOnes: count('1') % 2 === 0` · `noDoubleZero: !s.includes('00')`.

### Why testing up to length 6 is enough here
Two inequivalent DFAs with m and n states differ on some string of length ≤ m+n−2 (from
partition refinement). Reference machines have 3, 2, 3 states and user machines ≤ 5, so a
bound of 6 suffices. A sampled check of 900,000 random ≤5-state machines against the three
references found a longest shortest-distinguishing string of length **5**. **Rule:** if the
state cap rises above 5 or a goal needs a bigger reference machine, raise the test length
accordingly and re-check.

## 5. Common mistakes (reject these in code review)
- Power set that omits ∅ or the set itself · prefix list that omits ε or the whole string.
- Inorder described as "sorted" for a non-BST · mixing up preorder and postorder.
- A DFA with a missing transition (not a DFA) · complementing without making δ total.
- Treating A \ B as symmetric · treating A × B as unordered.
- Saying "ε is not a string" or confusing ε with ∅.

## 6. Glossary / Journal entries (12 symbol shards, 3 per district)
| Shard id | Symbol | Name | One-line definition | District |
|---|---|---|---|---|
| `sigma` | Σ | Alphabet | Finite, non-empty set of symbols a string is built from. | str |
| `epsilon` | ε | Empty string | The string with no symbols; length 0. | str |
| `reverse` | w^R | Reverse | The same symbols in the opposite order. | str |
| `union` | ∪ | Union | Everything that is in A or in B (or both). | set |
| `intersection` | ∩ | Intersection | Only what is in both A and B. | set |
| `symdiff` | Δ | Symmetric difference | What is in exactly one of A and B. | set |
| `nlr` | NLR | Preorder | Visit the node, then the left subtree, then the right. | tree |
| `lnr` | LNR | Inorder | Left subtree, node, right subtree (sorted on a BST). | tree |
| `lrn` | LRN | Postorder | Left subtree, right subtree, then the node. | tree |
| `delta` | δ | Transition function | Maps (state, symbol) to the next state. | dfa |
| `q0` | q₀ | Start state | The state a run begins in. | dfa |
| `accept` | F | Accepting states | If the run ends here, the string is accepted. | dfa |

## 7. Golden test values (verified)
**BST traversals** (build by inserting keys in the given order):
| Insert order | Preorder | Inorder | Postorder |
|---|---|---|---|
| 4,2,6,1,3,5,7 | 4 2 1 3 6 5 7 | 1 2 3 4 5 6 7 | 1 3 2 5 7 6 4 |
| 1,2,3 | 1 2 3 | 1 2 3 | 3 2 1 |
| 3,2,1 | 3 2 1 | 1 2 3 | 1 2 3 |
| 5,3,8,1,4,7,9 | 5 3 1 4 8 7 9 | 1 3 4 5 7 8 9 | 1 4 3 7 9 8 5 |

**DFA:** each reference machine matches its predicate on all 127 strings (0 mismatches); the
complement of each machine disagrees with the original on all 127 strings.

**Strings:** `prefixes("abc") = ["", "a", "ab", "abc"]` (4 = n+1) · `reverse("abc") = "cba"` · `isPalindrome("abba") = true` · `isPalindrome("") = true`.

**Sets (U={1..8}):** A={1,2,3}, B={3,4}: A∪B={1,2,3,4}; A∩B={3}; A\B={1,2}; AΔB={1,2,4}; A′={4,5,6,7,8}; |𝒫(A)|=8; |A×B|=6.
**Set Park challenge:** exactly 16 (A,B) pairs satisfy it.

## 8. Exam and quick-check question rules
Each question object: `{ id, topic, prompt, visual?, options:[4], answerIndex, explain }`.
- Generated from a seeded `rng`; the same seed gives the same exam (testable).
- **Correct answer is computed by `js/logic/`**, never hard-coded.
- Exactly one option equals the correct answer; options are unique; distractors are plausible (e.g., the *other* traversals of the same tree, off-by-one counts, A∪B for A Δ B).
- State conventions in the prompt where ambiguity exists ("count ε and the whole string").
- Exam = 8 questions, 2 per district; pass at ≥ 6/8. Types:
  - str: number of prefixes of `w` (n+1) · reverse of `w·v` (= v^R w^R computed).
  - set: result of a given operation on given A, B · number of subsets of A (2^|A|).
  - tree: preorder/inorder/postorder of a displayed tree · which traversal lists a BST in ascending order.
  - dfa: is string `s` accepted by the displayed machine · is `s` accepted by its complement.
- Quick check (end of each Learn lesson): 3 questions from the same generators, topic-specific.

## 9. Lesson content rules
- Every displayed result comes from `AC.logic`. Lesson text may *describe*; numbers/sets/strings shown are *computed*.
- One new idea per step; plain-language first, then the symbol; ≤ 30 words; example data small (strings ≤ 5 symbols, sets ≤ 5 elements, trees 7 nodes, DFAs ≤ 4 states).
- Suggested step outlines are in `workflows/M3_blackboard-lessons.md`.
