package com.example.User_Service.ServiceImp;

import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.BodyInserters;

import com.example.User_Service.Model.LoginRequest;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class LoginService {

    private final WebClient webClient;

    @Value("${keycloak.server-url}") private String serverUrl;
    @Value("${keycloak.realm}") private String realm;
    @Value("${keycloak.admin.username}")
    private String username;

    @Value("${keycloak.admin.password}")
    private String password;

    public LoginService(WebClient webClient) {
        this.webClient = webClient;
    }

    public JsonNode login(LoginRequest req) {
        return webClient
                .post()
                .uri(serverUrl + "/realms/" + realm + "/protocol/openid-connect/token")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .bodyValue(
                        "grant_type=password" +
                                "&client_id=admin-cli" +
                                "&username=" + username +
                                "&password=" + password

                )
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

}
