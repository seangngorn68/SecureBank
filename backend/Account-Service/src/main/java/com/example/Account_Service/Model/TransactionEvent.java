package com.example.Account_Service.Model;

import lombok.Data;

@Data
public class TransactionEvent {

    private String accountNumber;
    private Double amount;
}
