package com.example.Account_Service.ServiceImp;

import com.example.Account_Service.Config.EventConstants;
import com.example.Account_Service.Config.RabbitConfig;
import com.example.Account_Service.Model.*;
import com.example.Account_Service.Repository.AccountRepository;
import com.example.Account_Service.Service.AccountService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class AccountServiceImp  implements AccountService {

    private final AccountRepository accountRepository;
    private final RabbitTemplate rabbitTemplate;           // RabbitTemplate for publishing
    private final TopicExchange notificationExchange;

    public AccountServiceImp(AccountRepository accountRepository, RabbitTemplate rabbitTemplate, TopicExchange notificationExchange) {
        this.accountRepository = accountRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.notificationExchange = notificationExchange;
    }

    @Override
    public List<AccountResponse> readAllAccounts() {
        return accountRepository.findAll().stream().map(
                account -> {
                    AccountResponse accountResponse = new AccountResponse();
                    accountResponse.setBalance(account.getBalance());
                    accountResponse.setNumber(account.getNumber());
                    return accountResponse;
                }
        )
        .toList();
    }

    @Override
    public AccountResponse readAccountById(int id) {
        Account account = accountRepository.findById(id).orElse(null);
        AccountResponse accountResponse = new AccountResponse();
        accountResponse.setBalance(account.getBalance());
        accountResponse.setNumber(account.getNumber());

        return accountResponse;
    }

    @Override
    public Account createAccount(AccountRequest accountRequest) {
        Account account = new Account();
        account.setNumber(accountRequest.getNumber());
        account.setBalance(accountRequest.getBalance());
        accountRepository.save(account);


//        // 2️⃣ Publish NotificationEvent to Notification Service
//        NotificationEvent event = NotificationEvent.builder()
//                .eventId(UUID.randomUUID().toString())
//                .eventType(EventConstants.ACCT_CREATED)
//                .recipientUserId(userId)  // assuming accountRequest contains userId
//                .title("Account Created")
//                .message("Your account " + accountRequest.getNumber() + " has been successfully created.")
//                .data(account) // optional, you can pass the account object as payload
//                .createdAt(Instant.now())
//                .build();
//
//        log.info("Received notification event: {}", event);
//
//
//        rabbitTemplate.convertAndSend(
//                notificationExchange.getName(),       // TopicExchange bean
//                EventConstants.ACCT_CREATED, // routing key
//                event
//        );

        return account;
    }



    @RabbitListener(queues = RabbitConfig.TRANSACTION_QUEUE)
    @Transactional
    public void handleTransaction(TransactionRequest request) {

        Account account = accountRepository
                .findByNumber(request.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getBalance() < request.getAmount()) {
            throw new RuntimeException("Insufficient balance");
        }
       System.out.println("123445::" +account.getBalance());
        System.out.println("123445::" +request.getAmount());
        account.setBalance(account.getBalance() - request.getAmount());
        accountRepository.save(account);
    }
}
