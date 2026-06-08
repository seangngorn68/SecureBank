package com.example.TransactionService.order;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserDto {
    private String id;
    private String name;
    private String email;

    // getters & setters
}
