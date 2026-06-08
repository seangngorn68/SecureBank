package com.example.TransactionService.Services;

import com.example.TransactionService.Model.Transaction;
import com.example.TransactionService.Model.TransactionRequest;
import com.example.TransactionService.Model.TransactionRespone;

import java.util.List;

public interface TransactionService {
    List<TransactionRespone>  findAllTransactions();
    TransactionRespone findTransactionById(int id);
    Transaction saveTransaction(TransactionRequest transactionRequest);

    void create(Transaction tx);
}
