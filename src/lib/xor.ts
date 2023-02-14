export type XOR<A, B> =
  | ({ [P in keyof A]?: P extends keyof B ? A[P] : never } & B)
  | ({ [P in keyof B]?: P extends keyof A ? B[P] : never } & A);
