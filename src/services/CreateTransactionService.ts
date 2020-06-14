import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const validTypes = ['income', 'outcome'];

    if (!validTypes.includes(type)) {
      throw new AppError('Transaction type must be a valid one.', 400);
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total - value < 0) {
      throw new AppError('You do not have money enough', 400);
    }

    const categoriesRepository = getRepository(Category);

    let checkIfCategoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!checkIfCategoryExists) {
      checkIfCategoryExists = await categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(checkIfCategoryExists);
    }

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category: checkIfCategoryExists,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
