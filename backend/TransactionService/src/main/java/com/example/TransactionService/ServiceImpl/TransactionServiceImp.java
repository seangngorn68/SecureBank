package com.example.TransactionService.ServiceImpl;

import com.example.TransactionService.Model.*;
import com.example.TransactionService.Repository.TransactionRepository;
import com.example.TransactionService.Services.TransactionService;
import com.example.TransactionService.config.RabbitConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.List;



@Service
public class TransactionServiceImp  implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final RabbitTemplate rabbitTemplate;
    public TransactionServiceImp(TransactionRepository transactionRepository, RabbitTemplate rabbitTemplate) {
        this.transactionRepository = transactionRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public List<TransactionRespone> findAllTransactions() {

        return transactionRepository.findAll().stream().map(
                Transaction -> {
                    TransactionRespone  transactionRespone = new TransactionRespone();
                    transactionRespone.setAmount(Transaction.getAmount());
                    transactionRespone.setAccountNumber(Transaction.getAccountNumber());
                    return transactionRespone;
                }
        )
                .toList();
    }

    @Override
    public TransactionRespone findTransactionById(int id) {

        Transaction transaction = transactionRepository.findById(id).orElse(null);
        TransactionRespone transactionRespone = new TransactionRespone();
        transactionRespone.setAmount(transaction.getAmount());
        transactionRespone.setAccountNumber(transaction.getAccountNumber());

        return transactionRespone;
    }

    @Override
    public Transaction saveTransaction(TransactionRequest transactionRequest) {
        Transaction transaction = new Transaction();
        transaction.setAmount(transactionRequest.getAmount());
        transaction.setAccountNumber(transactionRequest.getAccountNumber());

        Transaction savedTransaction = transactionRepository.save(transaction);



        TransactionEvent event = new TransactionEvent(
                savedTransaction.getId(),
                savedTransaction.getAccountNumber(),
                savedTransaction.getAmount()
        );

        rabbitTemplate.convertAndSend(
                RabbitConfig.TRANSACTION_EXCHANGE,
                RabbitConfig.TRANSACTION_ROUTING_KEY,
                transactionRequest
        );


        return transaction;
    }

    @Override
    public void create(Transaction tx) {

        transactionRepository.save(tx);

        TransactionEventQ event = new TransactionEventQ(tx.getAccountNumber(),tx.getAmount());

        rabbitTemplate.convertAndSend(
                RabbitConfig.EXCHANGE,
                RabbitConfig.ROUTING_KEY,
                event

        );


    }


}
