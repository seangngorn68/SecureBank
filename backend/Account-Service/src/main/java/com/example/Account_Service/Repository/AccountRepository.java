package com.example.Account_Service.Repository;

import com.example.Account_Service.Model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository  extends JpaRepository<Account, Integer> {

    Optional<Account> findByNumber(String number);
}
