package com.example.TransactionService.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionEvent {
    private Long transactionId;
    private String accountNumber;
    private Double amount;

    public TransactionEvent(String accountNumber, Double amount) {
    }
}
