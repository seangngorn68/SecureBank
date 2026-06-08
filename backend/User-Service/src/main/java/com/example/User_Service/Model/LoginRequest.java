package com.example.User_Service.Model;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
