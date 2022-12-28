package com.project.social.model;

import com.project.social.entity.ImageModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

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
    String profilePicture;
    byte[] fullImage;
    boolean enabled;
}
