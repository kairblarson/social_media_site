package com.project.social.service;

import com.project.social.entity.CustomUserDetails;
import com.project.social.entity.User;
import com.project.social.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User user = userRepo.findByEmail(email);

        if(user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        return new CustomUserDetails(user);
    }
}
