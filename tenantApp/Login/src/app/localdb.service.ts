// src/app/services/local-database.service.ts
import { Injectable } from '@angular/core';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  updatedAt: string;
  createdByTenantId: number;
  isSynced?: boolean; // optional because server data may not include it
}

@Injectable({
  providedIn: 'root',
})
export class LocalDatabaseService {
  private db!: Database;
  private SQL!: SqlJsStatic;

  constructor() {
    this.initDB();
  }

  async initDB() {
  this.SQL = await initSqlJs({ locateFile: (file: string) => `https://sql.js.org/dist/${file}` });

    this.db = new this.SQL.Database();

    // Create Customer table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        updatedAt TEXT,
        createdByTenantId INTEGER,
        isSynced INTEGER DEFAULT 0
      );
    `);
  }

  async addOrUpdateCustomer(customer: Customer, markSynced = true): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO customers (id, name, email, phone, updatedAt, createdByTenantId, isSynced)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `);

    stmt.run([
      customer.id,
      customer.name,
      customer.email,
      customer.phone,
      customer.updatedAt,
      customer.createdByTenantId,
      markSynced ? 1 : 0,
    ]);

    stmt.free();
  }

  async getUnsyncedCustomers(): Promise<Customer[]> {
    const stmt = this.db.prepare(`SELECT * FROM customers WHERE isSynced = 0;`);
    const customers: Customer[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
    customers.push(row as unknown as Customer);

    }

    stmt.free();
    return customers;
  }

  async saveServerCustomers(customers: Customer[]): Promise<void> {
    for (const customer of customers) {
      await this.addOrUpdateCustomer(customer, true); // mark as synced
    }
  }

  async markAllAsSynced(): Promise<void> {
    this.db.run(`UPDATE customers SET isSynced = 1;`);
  }

  async getAll(): Promise<Customer[]> {
    const stmt = this.db.prepare(`SELECT * FROM customers;`);
    const results: Customer[] = [];

    while (stmt.step()) {
     results.push(stmt.getAsObject() as unknown as Customer);

    }

    stmt.free();
    return results;
  }
}
