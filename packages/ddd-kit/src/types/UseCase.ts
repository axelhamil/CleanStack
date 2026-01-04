import type { Result } from "../core/Result";

/**
 * Interface for application use cases in Domain-Driven Design.
 * Use cases encapsulate business logic and orchestrate domain operations.
 * @template Input The type of the input parameter.
 * @template Output The type of the output value.
 */
export interface UseCase<Input, Output> {
  /**
   * Executes the use case with the given input.
   * @param input The input data for the use case.
   * @returns A Result containing the output or an error.
   */
  execute(input: Input): Promise<Result<Output>> | Result<Output>;
}
