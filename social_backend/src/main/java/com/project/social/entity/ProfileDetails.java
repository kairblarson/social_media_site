package com.project.social.entity;

import java.util.ArrayList;
import java.util.List;

//this is a dto
public class ProfileDetails {

    private String username;
    private String fullName;
    private String bio;
    private boolean isFollowed;
    private List<Post> posts = new ArrayList<>();
    private Integer followers;
    private Integer following;

    public ProfileDetails() {
    }

    public ProfileDetails(String username, String fullName, String bio, boolean isFollowed, List<Post> posts, Integer followers, Integer following) {
        this.username = username;
        this.fullName = fullName;
        this.bio = bio;
        this.isFollowed = isFollowed;
        this.posts = posts;
        this.followers = followers;
        this.following = following;
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

    public List<Post> getPosts() {
        return posts;
    }

    public void setPosts(List<Post> posts) {
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
}
