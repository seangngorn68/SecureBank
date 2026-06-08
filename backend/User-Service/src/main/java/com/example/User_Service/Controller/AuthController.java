package com.example.User_Service.Controller;

import com.example.User_Service.Model.LoginRequest;
import com.example.User_Service.Model.SignupRequest;
import com.example.User_Service.Service.UserService;
import com.example.User_Service.ServiceImp.KeycloakUserService;
import com.example.User_Service.ServiceImp.LoginService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final LoginService loginService;

    private final KeycloakUserService keycloakUserService;

    public AuthController(UserService userService, LoginService loginService, KeycloakUserService keycloakUserService) {
        this.userService = userService;
        this.loginService = loginService;
        this.keycloakUserService = keycloakUserService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {

        String userId = keycloakUserService.creatUser(request);

        Map<String, Object> response = Map.of(
                "message", "User created successfully",
                "userId", userId
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Call login service
        var tokenResponse = keycloakUserService.login(request);
        return ResponseEntity.ok(tokenResponse);
    }

//    @PostMapping("/login")
//    public ResponseEntity<JsonNode> login(@RequestBody LoginRequest req) {
//        return ResponseEntity.ok(loginService.login(req));
//    }
}