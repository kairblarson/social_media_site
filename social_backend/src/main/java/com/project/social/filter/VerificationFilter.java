package com.project.social.filter;

import com.project.social.config.SecurityConfig;
import com.project.social.entity.User;
import com.project.social.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class VerificationFilter extends OncePerRequestFilter {

    @Autowired
    private UserRepo userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if(request.getUserPrincipal() != null) {
            Optional<User> optionalUser = Optional.of(userRepo.findByUsername(request.getUserPrincipal().getName()));
            if(optionalUser.isPresent()) {
                User user = optionalUser.get();
                if(!user.isEnabled()) {
                    System.out.println("USER NOT ENABLED");
                    throw new ServletException("User not enabled");
                }
                else {

                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
