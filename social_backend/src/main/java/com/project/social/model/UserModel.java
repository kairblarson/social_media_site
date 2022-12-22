package com.project.social.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserModel {

    String fullName;
    String username;
    String email;
    String password;
    String role;
    String bio;
    boolean enabled;
}
