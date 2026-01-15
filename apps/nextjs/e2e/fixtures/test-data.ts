export const testUsers = {
  newUser: {
    name: "E2E Test User",
    email: `e2e-${Date.now()}@test.local`,
    password: "TestPassword123!",
  },
  existingUser: {
    email: "test@example.com",
    password: "Password123!",
    name: "Test User",
  },
};

export function generateUniqueEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@test.local`;
}
