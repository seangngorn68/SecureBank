package com.example.TransactionService.order;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserSummary {
    private String id;
    private String name;

    public UserSummary(String id, String name) {
        this.id = id;
        this.name = name;
    }
}
