import type { Transaction } from "@packages/drizzle";
import type { IEntity } from "../core/Entity";
import type { Option } from "../core/Option";
import type { Result } from "../core/Result";
import type { PaginatedResult, PaginationParams } from "./Pagination";

/**
 * Base interface for repositories in Domain-Driven Design.
 * Repositories abstract the persistence layer for aggregates/entities.
 * @template T The type of entity managed by the repository.
 */
export interface BaseRepository<T extends IEntity<unknown>> {
  /**
   * Persists a new entity.
   */
  create(entity: T, trx?: Transaction): Promise<Result<T>>;

  /**
   * Updates an existing entity.
   */
  update(entity: T, trx?: Transaction): Promise<Result<T>>;

  /**
   * Deletes an entity by its ID.
   */
  delete(id: T["_id"], trx?: Transaction): Promise<Result<T["_id"]>>;

  /**
   * Finds an entity by its unique identifier.
   */
  findById(id: T["_id"]): Promise<Result<Option<T>>>;

  /**
   * Finds all entities with pagination.
   */
  findAll(pagination?: PaginationParams): Promise<Result<PaginatedResult<T>>>;

  /**
   * Finds entities matching properties with pagination.
   */
  findMany(
    props: Partial<T["_props"]>,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<T>>>;

  /**
   * Finds a single entity by matching properties.
   */
  findBy(props: Partial<T["_props"]>): Promise<Result<Option<T>>>;

  /**
   * Checks if an entity exists by its unique identifier.
   */
  exists(id: T["_id"]): Promise<Result<boolean>>;

  /**
   * Returns the total number of entities.
   */
  count(): Promise<Result<number>>;
}
