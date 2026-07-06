package com.suce.service;

import com.suce.entity.User;
import com.suce.exception.ApiException;
import com.suce.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository userRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.encoder = encoder;
    }

    @Transactional
    public User updateProfile(User user, Map<String, String> body) {
        if (body.containsKey("firstName")) user.setFirstName(body.get("firstName"));
        if (body.containsKey("lastName"))  user.setLastName(body.get("lastName"));
        if (body.containsKey("phone"))     user.setPhone(body.get("phone"));
        return userRepo.save(user);
    }

    @Transactional
    public void changePassword(User user, Map<String, String> body) {
        String current = body.get("currentPassword");
        String newPwd  = body.get("newPassword");
        if (!encoder.matches(current, user.getPassword()))
            throw new ApiException("Current password is incorrect", HttpStatus.BAD_REQUEST);
        user.setPassword(encoder.encode(newPwd));
        userRepo.save(user);
    }
}
