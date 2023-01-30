package com.project.social.entity;

import com.project.social.config.SecurityConfig;
import org.aspectj.util.FileUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.Entity;
import java.io.File;
import java.io.Serializable;
import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails, Serializable {

    User user;
    private final String BASE_PATH = "/Users/kairb/Desktop/Fullstack projects/social_site/images"; //will have to adjust this when deployed
    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        return Collections.singleton(new SimpleGrantedAuthority(user.getRole()));
    }

    public String getFullName() {

        return user.getFullName();
    }

    public String getBio() {
        return user.getBio();
    }

    public byte[] getProfilePicture() {
        File imagePath = new File(BASE_PATH+"\\"+user.getProfilePicture());
        try{
            if(imagePath != null) {
                if(imagePath.exists()) {
                    return FileUtil.readAsByteArray(imagePath);
                }
            }
        }catch (Exception e) {
            System.out.println("CAUGHT!: "+e.getLocalizedMessage());
        }
        return null;
    }

    public String getPpCDNLink() {
        return user.getPpCDNLink();
    }

    public String getEmail() {

        return user.getEmail();
    }
    @Override
    public String getPassword() {

        return user.getPassword();
    }

    @Override
    public String getUsername() {

        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {

        return true;
    }

    @Override
    public boolean isAccountNonLocked() {

        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {

        return true;
    }

    @Override
    public boolean isEnabled() {

        return true;
    }
}
