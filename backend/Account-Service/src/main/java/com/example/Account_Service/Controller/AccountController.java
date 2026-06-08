package com.example.Account_Service.Controller;


import com.example.Account_Service.Model.Account;
import com.example.Account_Service.Model.AccountRequest;
import com.example.Account_Service.Model.AccountResponse;
import com.example.Account_Service.Service.AccountService;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/account")
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }
//    @PostMapping
//    public Account createAccount(@RequestBody AccountRequest accountRequest, @AuthenticationPrincipal Jwt jwt) {
////        return accountService.createAccount(accountRequest);
//    }


    @PostMapping
    public Account createAccount(@RequestBody AccountRequest accountRequest) {
        return accountService.createAccount(accountRequest);
    }

    @GetMapping
    public List<AccountResponse> getAllAccounts() {
        return accountService.readAllAccounts();
    }

    @GetMapping("/{id}")
    public AccountResponse getAccountById(@PathVariable int id) {
        return accountService.readAccountById(id);
    }



}
