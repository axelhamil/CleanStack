import type { BaseRepository, Option, Result } from "@packages/ddd-kit";
import type { User, UserId } from "@/domain/user";

export interface IUserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<Result<Option<User>>>;
  findById(id: UserId): Promise<Result<Option<User>>>;
}
