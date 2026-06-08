package com.example.Account_Service.Service;

import com.example.Account_Service.Model.Account;
import com.example.Account_Service.Model.AccountRequest;
import com.example.Account_Service.Model.AccountResponse;

import java.util.List;

public interface AccountService {
    List<AccountResponse> readAllAccounts();
    AccountResponse readAccountById(int id);
    Account createAccount(AccountRequest accountRequest);
}
