package com.example.User_Service.Repository;

import com.example.User_Service.Model.User;
import com.example.User_Service.Model.UserResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    User findByEmail(String email);

    boolean existsByUsername(String username);

  //  Optional<Object> findById(Long id);
}
