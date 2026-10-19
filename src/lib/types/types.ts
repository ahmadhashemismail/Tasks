export type Task = {
  id: number;
  title: string;
  note: string | null;
  date: string | null;
  enddate: string | null;
  done: boolean;
};
 export type Customer = {
  id: number;
  name: string;
  debts: number; // numeric columns come back from Postgres as strings
  cost: number;
  balance: number; // balance is not stored in the database, but calculated as cost - debts
}