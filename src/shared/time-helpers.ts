// Return Date object that denotes the moment of runtime
// Wrap it in the method for easier to mock for unit test
export function getNow(): Date {
  return new Date(Date.now());
}
