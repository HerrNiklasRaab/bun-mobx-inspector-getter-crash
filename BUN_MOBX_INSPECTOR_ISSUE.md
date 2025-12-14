# Bun Inspector MobX Observable Getter Bug

## Title
Bun inspector (debug.bun.sh / VS Code) evaluates MobX observable property getter without correct receiver (this), causing `this[$mobx]` undefined

## Status
**REPRODUCED** - Issue filed: https://github.com/oven-sh/bun/issues/25517

## Reproduction Repository

**https://github.com/HerrNiklasRaab/bun-mobx-inspector-getter-crash**

```bash
git clone https://github.com/HerrNiklasRaab/bun-mobx-inspector-getter-crash
cd bun-mobx-inspector-getter-crash
bun install
bun --inspect index.mjs
```

Then:
1. Open the DevTools URL from the output (or open debug.bun.sh and connect)
2. The program is paused at `debugger;`
3. In "Scope" / "Variables" expand `req`
4. **Observation**: For the field `_updatedAt`, instead of the value, an error appears:
   ```
   TypeError: undefined is not an object (evaluating 'this[$mobx].getObservablePropValue_')
   ```

## Expected vs Actual

### Expected
The Inspector shows the actual value for `_updatedAt` (e.g., `Date`).

### Actual
When expanding, the getter is executed without `this` being correctly bound → MobX internal `this[$mobx]` is `undefined` → TypeError.

## Why This Is a Good Repro

- It's only MobX + Bun Inspector
- Runtime access (`req._updatedAt`) works
- `desc.get.call(req)` works
- Only the Inspector evaluation when displaying/expanding breaks

## Environment

| Component | Version |
|-----------|---------|
| Bun | 1.3.4 |
| MobX | 6.15.0 |
| OS | Darwin 24.6.0 (macOS, arm64) |
| VS Code affected | Yes |

## Runtime Output (proof that runtime works)
```
runtime access ok: 2025-12-14T18:43:43.991Z
descriptor.get.call(req) ok: 2025-12-14T18:43:43.991Z
descriptor.get() throws: TypeError: undefined is not an object (evaluating 'this[$mobx].getObservablePropValue_')
```

## Root Cause

The Bun inspector evaluates property getters by calling `getter.call()` without passing the correct receiver object.

Proper implementation should call `getter.call(targetObject)` to ensure `this` is bound correctly.

## Notes

- `Object.getOwnPropertyDescriptor(req,"_updatedAt").get.call(req)` works
- `get()` without receiver throws
- This affects debugging experience for any codebase using MobX observables

---

## GitHub Issue Template (Copy/Paste Ready)

### Title
```
Bun inspector evaluates MobX observable property getter without correct receiver (this), causing TypeError
```

### Body
```markdown
**What version of Bun is used?**
1.3.4

**What platform is your computer?**
Darwin 24.6.0 arm64 (macOS)

**What steps can reproduce the bug?**

Minimal reproduction repository: https://github.com/HerrNiklasRaab/bun-mobx-inspector-getter-crash

\`\`\`bash
git clone https://github.com/HerrNiklasRaab/bun-mobx-inspector-getter-crash
cd bun-mobx-inspector-getter-crash
bun install
bun --inspect index.mjs
\`\`\`

1. Open debug.bun.sh and connect
2. While paused at `debugger;`, expand `req` in the Scope/Variables panel

**What is the expected behavior?**
The inspector shows the actual value for `_updatedAt` (a Date object).

**What do you see instead?**
When expanding `req`, the `_updatedAt` field shows:
\`\`\`
TypeError: undefined is not an object (evaluating 'this[$mobx].getObservablePropValue_')
\`\`\`

**Additional information**
- Runtime access (`req._updatedAt`) works correctly
- `Object.getOwnPropertyDescriptor(req,"_updatedAt").get.call(req)` works
- `Object.getOwnPropertyDescriptor(req,"_updatedAt").get()` (without receiver) throws

This suggests the inspector evaluates getters without binding the correct `this` receiver. MobX uses getters that require `this` to access internal observable state via `this[$mobx]`.

This also affects VS Code debugging with Bun.
```
