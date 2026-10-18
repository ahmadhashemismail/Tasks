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
  debts: string; // numeric columns come back from Postgres as strings
  cost: string;
  balance: string;
};
