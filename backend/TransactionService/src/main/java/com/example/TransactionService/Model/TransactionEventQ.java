package com.example.TransactionService.Model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionEventQ {

    private String accountNumber;
    private Double amount;
}
