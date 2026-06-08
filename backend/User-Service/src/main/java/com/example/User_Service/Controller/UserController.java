package com.example.User_Service.Controller;


import com.example.User_Service.Model.User;
import com.example.User_Service.Model.UserRequest;
import com.example.User_Service.Model.UserResponse;
import com.example.User_Service.Service.UserService;
import lombok.Getter;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;
    }


  /*  @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable  Long id){

        return  userService.getById(id);

    }

    @GetMapping
    public List<UserResponse> getAllUsers(){
        return userService.getAllUsers();
    }

    @PostMapping
    public User createUser( @RequestBody UserRequest userRequest){
        return userService.createUser(userRequest);
    }*/

}
