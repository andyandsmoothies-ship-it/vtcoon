# Good and Bad Tests

## Good Tests

**Integration-style**: Test through real interfaces, not mocks of internal parts.

```typescript
// GOOD: Tests observable behavior through the interface
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

Characteristics:

- Tests behavior users/callers care about
- Uses public API only
- Survives internal refactors
- Describes WHAT, not HOW
- One logical assertion per test

## Bad Tests

**Implementation-detail tests**: Coupled to internal structure.

```typescript
// BAD: Tests implementation details
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

Red flags:

- Mocking internal collaborators
- Testing private methods
- Asserting on call counts/order
- Test breaks when refactoring without behavior change
- Test name describes HOW not WHAT
- Verifying through external means instead of interface

```typescript
// BAD: Bypasses interface to verify
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: Verifies through interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

## Test Independence

Each test must run on its own without relying on the state or outcome of other tests. This is non-negotiable for CI/CD pipelines where tests may run in parallel or in any order.

```typescript
// BAD: Tests share mutable state — order-dependent
let sharedUser;

test("creates a user", async () => {
  sharedUser = await createUser({ name: "Alice" });
  expect(sharedUser.id).toBeDefined();
});

test("retrieves the created user", async () => {
  // FRAGILE: fails if the test above doesn't run first
  const retrieved = await getUser(sharedUser.id);
  expect(retrieved.name).toBe("Alice");
});

// GOOD: Each test sets up its own state
test("creates a user", async () => {
  const user = await createUser({ name: "Alice" });
  expect(user.id).toBeDefined();
});

test("created user is retrievable", async () => {
  const user = await createUser({ name: "Bob" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Bob");
});
```

## Clarity Over DRY

In test code, **readability beats reusability**. A test should read like a self-contained story. If you need to jump through 3 base classes to understand the setup, the test has failed its documentation purpose.

```typescript
// BAD: Abstracted to the point of opacity
class BaseCheckoutTest extends BaseCartTest {
  override setUp() {
    super.setUp();
    this.configurePayment();
  }
}

test("checkout succeeds", () => {
  // Where does `this.cart` come from? What's in it?
  const result = this.checkout();
  expect(result.ok).toBe(true);
});

// GOOD: Complete story in one place
test("checkout with valid cart returns confirmed order", () => {
  const cart = createCart();
  cart.add(productWith({ price: 10 }));
  const result = checkout(cart, validPaymentMethod);
  expect(result.status).toBe("confirmed");
});
```

Extract shared helpers (like `createCart()` or `productWith()`) into factory functions — but keep the test body self-contained. The reader should never have to leave the test to understand what it does.
