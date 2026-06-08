package com.example.User_Service.ServiceImp;

import com.example.User_Service.Model.SignupRequest;
import com.example.User_Service.Model.User;
import com.example.User_Service.Model.UserRequest;
import com.example.User_Service.Model.UserResponse;
import com.example.User_Service.Repository.UserRepository;
import com.example.User_Service.Service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final KeycloakUserService keycloakUserService;


    public UserServiceImpl(UserRepository userRepository, KeycloakUserService keycloakUserService) {
        this.userRepository = userRepository;
        this.keycloakUserService = keycloakUserService;
    }

//    @Override
//    public UserResponse getById(Long id) {
//
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        UserResponse response = new UserResponse();
//        response.setUsername(user.getUsername());
//        response.setEmail(user.getEmail());
//
//
//        return response;
//    }

    @Override
    public void signup(SignupRequest req) {
        if(userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        String kcUserId = keycloakUserService.creatUser(req);

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setKeycloakUserId(kcUserId);

        userRepository.save(user);

    }

//    @Override
//    public User createUser(UserRequest userRequest) {
//
//        User user = new User();
//        user.setUsername(userRequest.getUsername());
//        user.setEmail(userRequest.getEmail());
//
//        userRepository.save(user);
//
//        return user;
//    }

//    @Override
//    public List<UserResponse> getAllUsers() {
//        return userRepository.findAll()
//                .stream()
//                .map(
//                    user -> {
//                        UserResponse response = new UserResponse();
//                        response.setUsername(user.getUsername());
//                        response.setEmail(user.getEmail());
//                    return response;
//                    })
//                .toList();
//    }
}
