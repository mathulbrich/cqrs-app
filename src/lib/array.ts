export const pushIf = <T>(array: Array<T>, value: T, condition: boolean): void => {
  if (condition) {
    array.push(value);
  }
};
