package com.project.social.entity;

import com.project.social.dto.PostDTO;
import org.springframework.core.io.InputStreamResource;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

//this is a dto
public class ProfileDetails {

    private String username;
    private String fullName;
    private String bio;
    private boolean isFollowed;
    private List<PostDTO> posts = new ArrayList<>();
    private Integer followers;
    private Integer following;
    private byte[] profilePicture;
    private boolean followedBy;
    private String ppCDNLink;

    public ProfileDetails() {
    }

    public ProfileDetails(String username,
                          String fullName,
                          String bio,
                          boolean isFollowed,
                          List<PostDTO> posts,
                          Integer followers,
                          Integer following,
                          byte[] profilePicture,
                          boolean followedBy,
                          String ppCDNLink) {
        this.username = username;
        this.fullName = fullName;
        this.bio = bio;
        this.isFollowed = isFollowed;
        this.posts = posts;
        this.followers = followers;
        this.following = following;
        this.profilePicture = profilePicture;
        this.followedBy = followedBy;
        this.ppCDNLink = ppCDNLink;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public boolean isFollowed() {
        return isFollowed;
    }

    public void setFollowed(boolean followed) {
        isFollowed = followed;
    }

    public List<PostDTO> getPosts() {
        return posts;
    }

    public void setPosts(List<PostDTO> posts) {
        this.posts = posts;
    }

    public Integer getFollowers() {
        return followers;
    }

    public void setFollowers(Integer followers) {
        this.followers = followers;
    }

    public Integer getFollowing() {
        return following;
    }

    public void setFollowing(Integer following) {
        this.following = following;
    }

    public byte[] getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(byte[] profilePicture) {
        this.profilePicture = profilePicture;
    }

    public boolean isFollowedBy() {
        return followedBy;
    }

    public void setFollowedBy(boolean followedBy) {
        this.followedBy = followedBy;
    }

    public String getPpCDNLink() {
        return ppCDNLink;
    }

    public void setPpCDNLink(String ppCDNLink) {
        this.ppCDNLink = ppCDNLink;
    }
}
