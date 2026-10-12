#!/usr/bin/env -S node

import type { Contract as Start } from '../../snapshots/5348b38c408dc912c66947808ab0577dd5c248778c34c3aa370942a2d9a63858/contract';
import startContract from '../../snapshots/5348b38c408dc912c66947808ab0577dd5c248778c34c3aa370942a2d9a63858/contract.json' with { type: 'json' };

import type { Contract as End } from '../../snapshots/9a9802b8a38af42e03dba09d888ed34f14d3f02c6e7d274333a79628bb03235f/contract';
import endContract from '../../snapshots/9a9802b8a38af42e03dba09d888ed34f14d3f02c6e7d274333a79628bb03235f/contract.json' with { type: 'json' };

import {
  Migration,
  MigrationCLI,
  col,
  rawSql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations(): any[] {
    return [
      this.addColumn({
        schema: 'public',
        table: 'doctor',
        column: col('email', 'text', {
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),

      this.addColumn({
        schema: 'public',
        table: 'doctor',
        column: col('name', 'text', {
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),

      rawSql({
        id: 'data.backfill-doctor-profile',
        label: 'Copy existing doctor names and emails',
        operationClass: 'data',
        target: { id: 'postgres' },
        precheck: [
          {
            description: 'Doctors need profile data',
            sql: `SELECT EXISTS (
              SELECT 1 FROM "public"."doctor"
              WHERE "name" IS NULL OR "email" IS NULL
            ) AS ok`,
          },
        ],
        execute: [
          {
            description: 'Copy profile data from linked users',
            sql: `UPDATE "public"."doctor" AS d
              SET "name" = u."name", "email" = u."email"
              FROM "public"."user" AS u
              WHERE d."userId" = u."id"
                AND (d."name" IS NULL OR d."email" IS NULL)`,
          },
        ],
        postcheck: [
          {
            description: 'Every doctor has a name and email',
            sql: `SELECT NOT EXISTS (
              SELECT 1 FROM "public"."doctor"
              WHERE "name" IS NULL OR "email" IS NULL
            ) AS ok`,
          },
        ],
      }),

      this.setNotNull({
        schema: 'public',
        table: 'doctor',
        column: 'name',
      }),
      this.setNotNull({
        schema: 'public',
        table: 'doctor',
        column: 'email',
      }),

      this.addUnique({
        schema: 'public',
        table: 'doctor',
        constraint: 'doctor_email_key',
        columns: ['email'],
      }),

      this.dropConstraint({
        schema: 'public',
        table: 'doctor',
        constraint: 'doctor_userId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'doctor',
        constraint: 'doctor_userId_key',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'doctor',
        column: 'userId',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
