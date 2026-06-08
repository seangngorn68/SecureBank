package com.example.User_Service.Model;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String password;
    private String email;
}
