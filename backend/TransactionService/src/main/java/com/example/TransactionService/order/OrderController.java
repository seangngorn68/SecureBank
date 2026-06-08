package com.example.TransactionService.order;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> create(@RequestBody Order order) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createOrder(order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrder() {
        List<Order> orders = service.getAllOrder();
        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Order fetched successfully",
                        orders
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getOrderById(id));
    }
}

