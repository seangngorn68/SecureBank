package com.example.TransactionService.order;

import com.example.TransactionService.globalException.ResourceNotFoundException;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository repository;
    private final WebClient webClient;

    public OrderService(OrderRepository repository, WebClient webClient) {
        this.repository = repository;
        this.webClient = webClient;
    }

    @Cacheable(
            value = "orders",
            key = "'all'"
    )
    public List<Order> getAllOrder() {
        List<Order> orders = repository.findAll();
        System.out.println("Order+::"+orders);
        return orders;
    }
    @Cacheable(
            value = "orderById",
            key = "#id",
            unless = "#result == null"
    )
    public OrderResponse getOrderById(String id) {

        Order order = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        UserDto user = webClient.get()
                .uri("http://localhost:8081/users/" + order.getUserId())
                .retrieve()
                .bodyToMono(UserDto.class)
                .block();

        OrderResponse response = new OrderResponse(
                order.getId(),
                order.getTotal(),
                new UserSummary(user.getId(), user.getName())
        );

        return response;
    }

    public ApiResponse<Order> createOrder(Order order) {
        return ApiResponse.success(
                HttpStatus.CREATED.value(),
                "Order created successfully",
                repository.save(order)
        );
    }
}

