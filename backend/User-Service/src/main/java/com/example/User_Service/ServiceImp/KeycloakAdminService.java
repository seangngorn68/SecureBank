package com.example.User_Service.ServiceImp;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;



@Service
@RequiredArgsConstructor
public class KeycloakAdminService {

    private final WebClient webClient;
    @Value("${keycloak.server-url}") private String serverUrl;
    @Value("${keycloak.admin.username}") private String adminUser;
    @Value("${keycloak.admin.password}") private String adminPass;


    public String getAdminToken() {
        return webClient
                .post()
                .uri(serverUrl + "/realms/master/protocol/openid-connect/token")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .bodyValue(
                        "grant_type=password" +
                                "&client_id=admin-cli" +
                                "&username=" + adminUser +
                                "&password=" + adminPass
                )
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(j -> j.get("access_token").asText())
                .block();
    }



}
