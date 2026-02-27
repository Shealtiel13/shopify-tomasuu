Create a Sequelize migration for schema changes in NexusHub.

## Instructions

Follow the project's migration conventions in `migrations/`:
- Use `queryInterface` methods (addColumn, removeColumn, addIndex, addConstraint, etc.)
- Include proper `up` and `down` methods (reversible migrations)
- Use underscored column/table names
- Reference existing table names as they appear in the database

## Migration Details

**Change:** $ARGUMENTS

## Steps
1. Create migration file in `migrations/` with timestamp prefix
2. Implement `up` method with the schema change
3. Implement `down` method to reverse the change
4. Update the corresponding model in `models/` if columns are added/removed
5. Run `npx sequelize-cli db:migrate` to apply (after user confirmation)
