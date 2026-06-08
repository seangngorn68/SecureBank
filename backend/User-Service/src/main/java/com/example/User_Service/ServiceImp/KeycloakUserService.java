package com.example.User_Service.ServiceImp;


import com.example.User_Service.Model.LoginRequest;
import com.example.User_Service.Model.SignupRequest;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KeycloakUserService {
    private final WebClient webClient;
    private final KeycloakAdminService adminService;
    @Value("${keycloak.server-url}") private String serverUrl;
    @Value("${keycloak.realm}") private String realm;

    @Value("${keycloak.client.id}")
    private String clientId;

    @Value("${keycloak.client.secret}")
    private String clientSecret;

    public  String creatUser(SignupRequest req) {

        String token = adminService.getAdminToken();
        Map<String, Object> body = Map.of(
                "username", req.getUsername(),
                "email", req.getEmail(),
                "enabled", true,
                "credentials", List.of(
                        Map.of("type", "password",
                                "value", req.getPassword(),
                                "temporary", false)
                )
        );

        // 3️⃣ POST user to Keycloak
        var response = webClient
                .post()
                .uri(serverUrl + "/admin/realms/" + realm + "/users")
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .toBodilessEntity()
                .block();

        if (response == null || response.getStatusCode().isError()) {
            throw new RuntimeException("Failed to create user in Keycloak");
        }

        // 4️⃣ Retrieve user ID from Location header
        String location = response.getHeaders().getLocation().toString();
        String userId = location.substring(location.lastIndexOf("/") + 1);

        return userId;
    }


    public JsonNode login(LoginRequest request) {


        JsonNode response;
        try {
            response = webClient.post()
                    .uri(serverUrl + "/realms/" + realm + "/protocol/openid-connect/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData("grant_type", "password")
                            .with("client_id", clientId)
                            .with("client_secret", clientSecret) // remove if public client
                            .with("username", request.getUsername())
                            .with("scope", "openid profile email")
                            .with("password", request.getPassword()))
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
        } catch (WebClientResponseException e) {
            System.out.println("Status: " + e.getStatusCode());
            System.out.println("Body: " + e.getResponseBodyAsString()); // Keycloak error message
            throw e;
        }
        return response;
    }
//        // 2️⃣ Build JSON body for impersonation
//        String body = "grant_type=password" +
//                "&client_id=" + clientId +
//                "&client_secret=" + clientSecret +
//                "&username=" + request.getUsername() +
//                "&password=" + request.getPassword();
//
//        // 3️⃣ Call Keycloak token endpoint
//        return webClient.post()
//                .uri(serverUrl + "/realms/" + realm + "/protocol/openid-connect/token")
//                .header("Content-Type", "application/x-www-form-urlencoded")
//                .bodyValue(body)
//                .retrieve()
//                .bodyToMono(JsonNode.class)
//                .block(); // block safe here for REST API
//
//



}
