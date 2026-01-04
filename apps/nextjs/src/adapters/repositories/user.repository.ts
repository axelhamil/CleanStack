import { Option, Result } from "@packages/ddd-kit";
import { type DbClient, db, eq, type Transaction } from "@packages/drizzle";
import { user as userTable } from "@packages/drizzle/schema";
import { UserMapper } from "@/adapters/mappers/user.mapper";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { User } from "@/domain/user/user.aggregate";
import type { UserId } from "@/domain/user/user-id";

export class DrizzleUserRepository implements IUserRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(entity: User, trx?: Transaction): Promise<Result<User>> {
    try {
      const data = UserMapper.toPersistence(entity);
      await this.getDb(trx)
        .insert(userTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
          updatedAt: data.updatedAt ?? new Date(),
        });
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create user: ${error}`);
    }
  }

  async update(entity: User, trx?: Transaction): Promise<Result<User>> {
    try {
      const data = UserMapper.toPersistence(entity);
      await this.getDb(trx)
        .update(userTable)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, String(entity.id.value)));
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update user: ${error}`);
    }
  }

  async delete(id: UserId, trx?: Transaction): Promise<Result<UserId>> {
    try {
      await this.getDb(trx)
        .delete(userTable)
        .where(eq(userTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete user: ${error}`);
    }
  }

  async findById(id: UserId): Promise<Result<Option<User>>> {
    try {
      const result = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      return Result.ok(Option.some(UserMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(`Failed to find user by id: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<Result<Option<User>>> {
    try {
      const result = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      return Result.ok(Option.some(UserMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(`Failed to find user by email: ${error}`);
    }
  }

  async findAll(): Promise<Result<User[]>> {
    try {
      const result = await db.select().from(userTable);
      return Result.ok(result.map(UserMapper.toDomain));
    } catch (error) {
      return Result.fail(`Failed to find all users: ${error}`);
    }
  }

  async findBy(props: Partial<User["_props"]>): Promise<Result<Option<User>>> {
    try {
      const email = props.email?.value;
      if (!email) {
        return Result.ok(Option.none());
      }
      return this.findByEmail(email);
    } catch (error) {
      return Result.fail(`Failed to find user: ${error}`);
    }
  }

  async exists(id: UserId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check user existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const result = await db.select().from(userTable);
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to count users: ${error}`);
    }
  }
}
