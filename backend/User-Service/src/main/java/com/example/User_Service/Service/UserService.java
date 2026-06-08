package com.example.User_Service.Service;

import com.example.User_Service.Model.SignupRequest;
import com.example.User_Service.Model.User;
import com.example.User_Service.Model.UserRequest;
import com.example.User_Service.Model.UserResponse;

import java.util.List;

public interface UserService {
   // User createUser(UserRequest userRequest);

   // List<UserResponse> getAllUsers();

  //  UserResponse getById(Long id);

    public void signup(SignupRequest req);


}
