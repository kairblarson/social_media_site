package com.project.social.config;

import com.project.social.entity.CustomOAuth2User;
import com.project.social.entity.CustomUserDetails;
import com.project.social.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Arrays;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

    private static String[] WHITE_LIST_URLS = {
            "/test/**",
            "/{username}/**",
            "/process-post/**",
            "/logout/**",
            "/login/**",
            "/request-timeline/**"
    };

    @Bean
    public AuthenticationManager manager(HttpSecurity http,
                                         CustomUserDetailsService customUserDetailsService,
                                         PasswordEncoder passwordEncoder) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(customUserDetailsService)
                .passwordEncoder(passwordEncoder)
                .and().build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, HttpServletRequest request, HttpSession currentSession) throws Exception {
        return http
                .cors(Customizer.withDefaults()).csrf(csrf -> csrf.disable())
                .authorizeRequests( auth -> auth.antMatchers(WHITE_LIST_URLS).permitAll().anyRequest().authenticated())
                .sessionManagement(session -> session.sessionFixation().none().sessionCreationPolicy(SessionCreationPolicy.ALWAYS))
                .formLogin(form -> form.loginPage("http://localhost:3000/login")
                        .usernameParameter("email")
                        .passwordParameter("password")
                        .loginProcessingUrl("/process")
                        .successHandler(new AuthenticationSuccessHandler() {
                            @Override
                            public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
                                response.sendRedirect("/successful-login");
                            }
                        })
                        .failureHandler(new AuthenticationFailureHandler() {
                            @Override
                            public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
                                System.out.println("Failed Login attempt");
                                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                                //do better than this
                            }
                        })
                        .permitAll())
                .logout(logout -> logout.deleteCookies("auth_code", "JSESSIONID")
                        .invalidateHttpSession(true)
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/successful-logout"))
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


}