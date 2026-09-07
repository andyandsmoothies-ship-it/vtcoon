# When to Mock

## The Detroit Rule

This project follows the **Detroit (Classical)** style. Use real collaborators whenever feasible. Only stub at slow or unpredictable boundaries.

Mock at **system boundaries** only:

- External APIs (payment, email, etc.)
- Databases (sometimes — prefer test DB or in-memory)
- Time/randomness
- File system (sometimes)

Don't mock:

- Your own classes/modules
- Internal collaborators
- Anything you control

## Detroit vs. London: Why It Matters

The London (Mockist) style mocks every dependency to isolate a single class. This creates a critical fragility problem: if you rename an internal method from `save()` to `add()` while preserving identical behavior, every London-style interaction test breaks immediately. You end up rewriting tests alongside the code, turning the safety net into a straitjacket.

```typescript
// LONDON STYLE — AVOID
// Breaks if you rename processPayment() or change call order
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);  // Interaction!
});

// DETROIT STYLE — PREFERRED
// Survives any internal refactor as long as the outcome is the same
test("checkout with valid cart returns confirmed order", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, testPaymentGateway);
  expect(result.status).toBe("confirmed");  // State/Output!
});
```

**When London style IS appropriate**: Verifying that a specific external side-effect occurred (e.g., "did we actually call the email service?"). Even then, prefer checking the observable result first.

## Designing for Mockability

At system boundaries, design interfaces that are easy to stub:

**1. Use dependency injection**

Pass external dependencies in rather than creating them internally:

```typescript
// Easy to stub
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// Hard to stub
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**2. Prefer SDK-style interfaces over generic fetchers**

Create specific functions for each external operation instead of one generic function with conditional logic:

```typescript
// GOOD: Each function is independently stubbable
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch('/orders', { method: 'POST', body: data }),
};

// BAD: Stubbing requires conditional logic inside the stub
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

The SDK approach means:
- Each stub returns one specific shape
- No conditional logic in test setup
- Easier to see which endpoints a test exercises
- Type safety per endpoint
