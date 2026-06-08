package com.example.Account_Service.ServiceImp;

import com.example.Account_Service.Config.RabbitConfig;
import com.example.Account_Service.Model.Account;
import com.example.Account_Service.Model.TransactionEvent;
import com.example.Account_Service.Repository.AccountRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AccountListener {

    private final AccountRepository repository;

    @RabbitListener(queues = RabbitConfig.QUEUE)
    @Transactional
    public void receive(TransactionEvent event) {
        System.out.println("Received event: " + event);

        Optional<Account> optionalAccount = repository.findByNumber(event.getAccountNumber());

        if (optionalAccount.isEmpty()) {
            System.out.println("Warning: Account not found: " + event.getAccountNumber());
            // Optionally, skip processing or create account
            return; // skip message, prevents loop
        }

        Account account = optionalAccount.get();
        account.setBalance(account.getBalance() + event.getAmount());
        repository.save(account);

        System.out.println("Updated balance for " + account.getNumber() + ": " + account.getBalance());
    }
}
