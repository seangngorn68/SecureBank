package com.example.TransactionService.user;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public User create(@RequestBody User user) {
        return service.create(user);
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable String id) {
        return service.getUserById(id);
    }
}