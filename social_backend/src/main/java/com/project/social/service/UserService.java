package com.project.social.service;

import com.project.social.dto.PostDTO;
import com.project.social.entity.*;
import com.project.social.model.PostModel;
import com.project.social.model.UserModel;
import com.project.social.util.NotificationType;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

public interface UserService {

    List<User> getAllUsers();
    User findByUsername(String username);
    User findByEmail(String email);
    void processOAuthPostLogin(String email, String name, String role);
    String processAccount(UserModel userModel);
    ProfileDetails getProfileDetails(String username, String email, Integer pageNum, String postType) throws Exception;
    List<PostDTO> requestTimeline(String username, Integer page);
    String addFollower(String username, String email);
    Post addPost(PostModel postModel, User author, Long targetId);
    List<User> addPostToLikes(Long id, String email);
    Set<Repost> addPostToReposts(Long id, String email);
    List<User> getFollowers(String username, String email, Integer pageNum);
    List<User> getFollowing(String username, String email, Integer pageNum);
    List<PostDTO> getPost(Long id, User currentUser);
    List<User> getPostInteractions(Long postId, String interaction, User currentUser, Integer page);
    Notification createNotification(User agent, String action, Post content, User userTo);
    void viewNotifications(User to);
    List<Notification> getNotifications(String email, Boolean exact, Integer page);
    User handleEditProfile(String username, String bio, MultipartFile file, String email) throws IOException;
    String deletePost(Long postID, String email);
    List<String> searchSuggestions(String keyword);
    List<User> userSearchResults(String keyword, Integer page);
    List<PostDTO> postSearchResults(String keyword, Integer page, String email);
}
