package com.example.TransactionService.globalException;

import lombok.Data;
import lombok.Setter;

import java.time.LocalDateTime;


@Setter
@Data
public class ErrorResponse {

    private int status;
    private String message;
    private String path;
    private LocalDateTime timestamp;

    public ErrorResponse(int status, String message, String path) {
        this.status = status;
        this.message = message;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }
}
