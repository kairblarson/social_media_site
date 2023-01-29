package com.project.social.model;

import com.project.social.entity.ImageModel;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserModel {

    String fullName;
    String username;
    String email;
    String password;
    String role;
    String bio;
    MultipartFile profilePicture;
    byte[] fullImage;
    boolean enabled;
}
