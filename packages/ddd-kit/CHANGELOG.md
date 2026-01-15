# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release with DDD primitives
- `Result<T, E>` - Railway-oriented error handling
- `Option<T>` - Null-safe value handling with pattern matching
- `Entity<T>` - Identity-based domain objects
- `Aggregate<T>` - Aggregate roots with domain events
- `ValueObject<T>` - Immutable value types with validation
- `UUID` - Type-safe identifiers
- `WatchedList<T>` - Change-tracked collections
- `DomainEvents` - Event dispatch system
- `BaseRepository<T>` - Repository interface with pagination
- Comprehensive test coverage
