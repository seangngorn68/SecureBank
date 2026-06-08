package com.example.TransactionService.Controller;


import com.example.TransactionService.Model.Transaction;
import com.example.TransactionService.Model.TransactionRequest;
import com.example.TransactionService.Model.TransactionRespone;
import com.example.TransactionService.Services.TransactionService;
import org.apache.catalina.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transaction")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public Transaction createTransaction(@RequestBody TransactionRequest transactionRequest) {
        return transactionService.saveTransaction(transactionRequest);
    }

    @GetMapping
    public List<TransactionRespone> getAllTransactions() {
        return transactionService.findAllTransactions();
    }
    @GetMapping("/{id}")
    public TransactionRespone getTransactionById(@PathVariable int id) {
        return transactionService.findTransactionById(id);
    }


    @PostMapping("/api")
    public String create(@RequestBody Transaction tx) {
        transactionService.create(tx);
        return "Transaction created & event sent";
    }

}
