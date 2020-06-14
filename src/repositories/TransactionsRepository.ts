import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  private async filterTransactionsByType(type: string): Promise<Transaction[]> {
    const transactions = await this.find();
    const filteredTransactions = transactions.filter(
      transaction => transaction.type === type,
    );

    return filteredTransactions;
  }

  public async getBalance(): Promise<Balance> {
    const incomeTransactions = await this.filterTransactionsByType('income');

    const outcomeTransactions = await this.filterTransactionsByType('outcome');

    const income = await incomeTransactions.reduce(
      (total: number, transaction: Transaction) =>
        total + Number(transaction.value),
      0,
    );

    const outcome = await outcomeTransactions.reduce(
      (total: number, transaction: Transaction) =>
        total + Number(transaction.value),
      0,
    );

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
