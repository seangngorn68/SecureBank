package com.example.TransactionService.order;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private int status;
    private String message;
    private T data;

    public ApiResponse(int status, boolean success, String message, T data) {

        this.status = status;

        this.message = message;
        this.data = data;


    }

    public static <T> ApiResponse<T> success(int status, String message, T data) {
        return new ApiResponse<>(status, message, data);
    }

    // getters
}

