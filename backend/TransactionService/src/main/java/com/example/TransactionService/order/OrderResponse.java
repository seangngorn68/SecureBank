package com.example.TransactionService.order;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class OrderResponse {

    private String orderId;
    private Double total;
    private UserSummary user;

    public OrderResponse(String orderId, Double total, UserSummary user) {
        this.orderId = orderId;
        this.total = total;
        this.user = user;
    }
}
