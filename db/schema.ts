import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const projects = sqliteTable('projects', {
 id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), title: text('title').notNull(), category: text('category').notNull(),
 status: text('status').notNull().default('draft'), visibility: text('visibility').notNull().default('private'),
 publishedData:text('published_data'),publishedAt:text('published_at'),revision:integer('revision').notNull().default(0),publishedRevision:integer('published_revision').notNull().default(0),
 deletedAt:text('deleted_at'), data: text('data').notNull(), createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
});
export const messages = sqliteTable('messages', {id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),role:text('role').notNull(),content:text('content').notNull(),createdAt:text('created_at').notNull()});
export const usage = sqliteTable('usage', {id:text('id').primaryKey(),count:integer('count').notNull().default(0)});
export const projectVersions = sqliteTable('project_versions', {id:text('id').primaryKey(),projectId:text('project_id').notNull(),ownerId:text('owner_id').notNull(),revision:integer('revision').notNull(),data:text('data').notNull(),label:text('label').notNull(),createdAt:text('created_at').notNull()});
export const advertisements = sqliteTable('advertisements', {id:text('id').primaryKey(),title:text('title').notNull(),body:text('body').notNull(),imageUrl:text('image_url').notNull(),href:text('href').notNull(),category:text('category').notNull().default('전체'),enabled:integer('enabled',{mode:'boolean'}).notNull().default(true),priority:integer('priority').notNull().default(0),updatedAt:text('updated_at').notNull(),updatedBy:text('updated_by').notNull()});

export const productSets=sqliteTable('product_sets',{id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),data:text('data').notNull(),updatedAt:text('updated_at').notNull()});
export const brandSettings=sqliteTable('brand_settings',{ownerId:text('owner_id').primaryKey(),data:text('data').notNull()});
export const productImageJobs=sqliteTable('product_image_jobs',{id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),setId:text('set_id').notNull(),data:text('data').notNull(),status:text('status').notNull(),rawPath:text('raw_path'),imageJson:text('image_json'),error:text('error'),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()});
export const inquiries=sqliteTable('inquiries',{id:text('id').primaryKey(),name:text('name').notNull(),email:text('email').notNull(),type:text('type').notNull(),content:text('content').notNull(),status:text('status').notNull().default('new'),consentVersion:text('consent_version').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()});
