package com.project.social.entity;

import java.util.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.project.social.provider.Provider;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.repository.cdi.Eager;

import javax.persistence.*;

@JsonIgnoreProperties({"hibernateLazyInitializer"}) //possible solution for any lazy serializing issues
@Entity
@NoArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String fullName;
    private String username;
    private String email;
    @JsonIgnore
    private String password;
    private String role;
    private String bio;
    private boolean enabled;
    @JsonIgnore
    @OneToMany(fetch = FetchType.EAGER, mappedBy = "author")
    private List<Post> posts = new ArrayList<>();
    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "comments")
    private List<Post> replies = new ArrayList<>();
    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "post_likes",
            joinColumns = @JoinColumn(name = "like_user_id"),
            inverseJoinColumns = @JoinColumn(name = "like_post_id"))
    private List<Post> likedPosts;
    @JsonIgnore
    @OneToMany(mappedBy = "rePoster")
    private List<Repost> reposts;
    @JsonIgnore
    @OneToMany(mappedBy="to")
    private List<Followers> followers;
    @JsonIgnore
    @OneToMany(mappedBy="from")
    private List<Followers> following;
    @JsonIgnore
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "to")
    private List<Notification> notifications = new ArrayList<>();

    @JsonIgnore
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "receiver")
    private List<Message> messages = new ArrayList<>();
    private boolean isFollowed = false;
    private String profilePicture;
    private byte[] fullImage;
    private String ppCDNLink;

    public User(String fullName, String username, String email, String password, String role, String bio, boolean enabled) {
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.bio = bio;
        this.enabled = enabled;
    }

    public User(String fullName, String username, String email, String password, String role, String bio, boolean enabled, byte[] fullImage) {
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.bio = bio;
        this.enabled = enabled;
        this.fullImage = fullImage;
    }

    @Enumerated(EnumType.STRING)
    private Provider provider;

    public Provider getProvider() {

        return provider;
    }

    public void setProvider(Provider provider) {

        this.provider = provider;
    }

    public void addPostToUser(Post post) {
        posts.add(post);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public List<Post> getPosts() {
        return posts;
    }

    public void setPosts(List<Post> posts) {
        this.posts = posts;
    }

    public List<Followers> getFollowers() {
        return followers;
    }

    public void setFollowers(List<Followers> followers) {
        this.followers = followers;
    }

    public List<Followers> getFollowing() {
        return following;
    }

    public void setFollowing(List<Followers> following) {
        this.following = following;
    }

    public List<Post> getLikedPosts() {
        return likedPosts;
    }

    public void setLikedPosts(List<Post> likedPosts) {
        this.likedPosts = likedPosts;
    }
    public void addToLikes(Post post) {
        this.likedPosts.add(post);
    }

    public List<Repost> getReposts() {
        return reposts;
    }

    public void setReposts(List<Repost> reposts) {
        this.reposts = reposts;
    }
    public void addPostToReposts(Repost repost) {
        reposts.add(repost);
    }

    public boolean isFollowed() {
        return isFollowed;
    }

    public void setFollowed(boolean followed) {
        isFollowed = followed;
    }

    public List<Post> getReplies() {
        return replies;
    }

    public void setReplies(List<Post> replies) {
        this.replies = replies;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }
    public void addToNotifications(Notification notification) {
        notifications.add(notification);
    }
    public void removeNotification(Notification notification) {
        notifications.remove(notification);
    }

    public String getProfilePicture() {
        if(profilePicture == null) {
            return "default.jpg";
        }
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public byte[] getFullImage() {
        return fullImage;
    }

    public void setFullImage(byte[] fullImage) {
        this.fullImage = fullImage;
    }

    public String getPpCDNLink() {
        return ppCDNLink;
    }

    public void setPpCDNLink(String ppCDNLink) {
        this.ppCDNLink = ppCDNLink;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", fullName='" + fullName + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", role='" + role + '\'' +
                ", enabled=" + enabled +
                '}';
    }
}
