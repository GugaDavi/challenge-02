import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table
      .uuid('user_id')
      .unsigned()
      .index()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.boolean('isDiet').notNullable()
    table.timestamp('date').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
