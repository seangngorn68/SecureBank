package com.example.Account_Service.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {


//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable()) // optional
//                .authorizeHttpRequests(auth -> auth
//                        // ✅ allow Prometheus + health endpoints
//                        .requestMatchers("/actuator/**").permitAll()
//
//                        // 🔐 other APIs still require JWT
//                        .anyRequest().authenticated()
//                )
//                .oauth2ResourceServer(oauth2 ->
//                        oauth2.jwt(jwt -> {
//                            // no deprecated call
//                        })
//                );
//
//        return http.build();
//    }

/*    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> {
                            // no deprecated call
                        })
                );

        return http.build();
    }*/
}