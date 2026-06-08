package com.example.TransactionService.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "transaction_new")
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor

public class Transaction {
    @Id
    @GeneratedValue
    private Long id;
    private String accountNumber;
    private Double amount;
}
