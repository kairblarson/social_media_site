package com.project.social.controller;

import com.project.social.config.SecurityConfig;
import com.project.social.dto.FullResults;
import com.project.social.dto.PostDTO;
import com.project.social.entity.*;
import com.project.social.model.PostModel;
import com.project.social.model.UserModel;
import com.project.social.service.CustomUserDetailsService;
import com.project.social.service.S3Service;
import com.project.social.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
public class MainController {

    @Autowired
    private UserService userService;

    @Autowired
    private CustomUserDetailsService service;

    @Autowired
    private S3Service s3Service; //might have to be static idk yet

    @GetMapping("/getSessionId")
    public ResponseEntity<String> getSessionId() {
        System.out.println("Get session id");
        return ResponseEntity.ok().body("REDIRECT");
    }

    @GetMapping("/successful-login")
    public ResponseEntity<Object> successfulLogin(Authentication authentication) {
        System.out.println("AUTHENTICATION: "+authentication);
        return ResponseEntity.ok().body(authentication);
    }

    @PostMapping(value = "/process-signup", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> processNewAccount(@RequestPart(value = "username", required = true) String username,
                                                    @RequestPart(value = "bio", required = false) String bio,
                                                    @RequestPart(value = "fullName", required = true) String fullName,
                                                    @RequestPart(value = "email", required = true) String email,
                                                    @RequestPart(value = "password", required = true) String password,
                                                    @RequestPart(value = "profilePicture", required = false) MultipartFile image,
                                                    HttpServletRequest request) {
        UserModel userModel = new UserModel();
        userModel.setFullName(fullName);
        userModel.setUsername(username);
        userModel.setProfilePicture(image);
        userModel.setPassword(password);
        userModel.setEmail(email);
        userModel.setBio(bio);

        String res = userService.processAccount(userModel, request);

        return ResponseEntity.ok().body(res);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Object> verifyEmail(@RequestParam(value = "token") String token, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create("/")).body(userService.verifyAccount(token));
    }

    @GetMapping("/successful-logout")
    public ResponseEntity<Object> successfulLogout(HttpSession session,
                                                   Authentication authentication,
                                                   HttpServletRequest request,
                                                   HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                cookie.setValue("");
                cookie.setPath("/");
                cookie.setMaxAge(0);
                response.addCookie(cookie);
            }
        }
        System.out.println("LOGOUT");
        SecurityConfig.users_online = SecurityConfig.users_online-1;
        return ResponseEntity.ok().body(HttpServletResponse.SC_ACCEPTED);
    }

    @GetMapping("/{username}/posts")
    public ResponseEntity<ProfileDetails> getProfileDetails(@PathVariable(value = "username") String username,
                                                            @RequestParam(value = "page") Integer pageNum,
                                                            Authentication authentication) throws Exception {
        String email = getEmailFromAuth(authentication);
        return ResponseEntity.ok().body(userService.getProfileDetails(username, email, pageNum, "posts"));
    }

    @GetMapping("/{username}/likes") //you can combine this method and the one above into one
    public ResponseEntity<ProfileDetails> getProfileLikes(@PathVariable(value = "username") String username,
                                                            @RequestParam(value = "page") Integer pageNum,
                                                            Authentication authentication) throws Exception {
        String email = getEmailFromAuth(authentication);
        return ResponseEntity.ok().body(userService.getProfileDetails(username, email, pageNum, "likes"));
    }

    @PostMapping(value = "/process-post", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Post> createPost(@RequestBody PostModel postModel,
                                           Authentication authentication,
                                           @RequestParam(value = "targetId", required = false) Long targetId) {
        System.out.println("CONTROLLER-POST: "+postModel.getContent());
        Post post = userService.addPost(postModel, userService.findByEmail(getEmailFromAuth(authentication)), targetId);
        return ResponseEntity.ok().body(post);
    }

    @GetMapping("/request-timeline")
    public ResponseEntity<List<PostDTO>> requestTimeline(@RequestParam(value = "page", required = false) Integer pageNum,
                                                         Authentication authentication) throws IOException {
        if(authentication == null) {
            System.out.println("RE DIRECT");
            return ResponseEntity.badRequest().body(null);
        }

        return ResponseEntity.ok().body(userService.requestTimeline(getEmailFromAuth(authentication), pageNum));
    }

    @GetMapping("/{username}/follow")
    public ResponseEntity<String> handleFollow(@PathVariable(value = "username") String username, Authentication authentication) {
        return ResponseEntity.ok().body(userService.addFollower(username, getEmailFromAuth(authentication)));
    }

    @GetMapping("/isAuth")
    public ResponseEntity<Object> isAuth(Authentication authentication) {
        if(authentication == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(authentication);
    }

    @PostMapping("/handle-like")
    public ResponseEntity<List<User>> handleLike(@RequestParam(value = "id") Long id,
                                                Authentication authentication,
                                                HttpServletResponse response) {
        if(authentication == null) {
            System.out.println("RE DIRECT");
            return ResponseEntity.badRequest().body(null);
        }
        List<User> likes = userService.addPostToLikes(id, getEmailFromAuth(authentication));
        return ResponseEntity.ok().body(likes);
    }

    @PostMapping("/handle-repost")
    public ResponseEntity<Integer> handleRepost(@RequestParam(value = "id") Long id,
                                                Authentication authentication,
                                                HttpServletResponse response) {
        if(authentication == null) {
            System.out.println("RE DIRECT");
            return ResponseEntity.badRequest().body(null);
        }
        Set<Repost> reposts = userService.addPostToReposts(id, getEmailFromAuth(authentication));
        return ResponseEntity.ok().body(reposts.size());
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<List<User>> getFollowers(@PathVariable(value = "username") String username,
                                                   @RequestParam(value = "page", required = false) Integer pageNum,
                                                       Authentication authentication) {
        return ResponseEntity.ok().body(userService.getFollowers(username, getEmailFromAuth(authentication), pageNum));
    }
    //probably didnt need 2 diff methods for this but this is easier
    @GetMapping("/{username}/following")
    public ResponseEntity<List<User>> getFollowing(@PathVariable(value = "username") String username,
                                                   @RequestParam(value = "page", required = false) Integer pageNum,
                                                   Authentication authentication) {
        return ResponseEntity.ok().body(userService.getFollowing(username, getEmailFromAuth(authentication), pageNum));
    }

    @GetMapping("/{username}/post/{id}") //this returns you the post
    public ResponseEntity<List<PostDTO>> getPostDetails(@PathVariable(value = "id") Long postId,
                                               Authentication authentication) {
        return ResponseEntity.ok().body(userService.getPost(postId, userService.findByEmail(getEmailFromAuth(authentication))));
    }

    @GetMapping("/{username}/post/{id}/{interaction}")
    public ResponseEntity<List<User>> getInteractionList(@PathVariable(value = "id") Long postId,
                                                         @PathVariable(value = "interaction") String interaction,
                                                         @RequestParam(value = "page", required = false) Integer page,
                                                         Authentication authentication) {
        return ResponseEntity.ok().body(userService.getPostInteractions(postId, interaction, userService.findByEmail(getEmailFromAuth(authentication)), page));
    }

    @GetMapping("/get-notifications")
    public ResponseEntity<List<Notification>> getNotifications(Authentication authentication,
                                                               @RequestParam(value = "exact") Boolean exact,
                                                               @RequestParam(value = "page", required = false) Integer page) {
        if(authentication == null){
            return ResponseEntity.ok().body(null);
        }
        return ResponseEntity.ok().body(userService.getNotifications(getEmailFromAuth(authentication), exact, page)); //exact vs relative
    }

    @PostMapping(value = "/{username}/handle-edit", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<User> handleEdit(@RequestPart(value = "username", required = false) String username,
                                           @RequestPart(value = "bio", required = false) String bio,
                                           @RequestPart(value = "profilePicture", required = false) MultipartFile image,
                                           Authentication authentication) {
        try{
            User currentUser = userService.handleEditProfile(username, bio, image, getEmailFromAuth(authentication)); //CHANGE PATH
            String res = s3Service.uploadToSpace(image, getEmailFromAuth(authentication));
            System.out.println("S3 RES: "+res); //TRY THIS WHEN YOU GET BACK
            return ResponseEntity.ok().body(currentUser);
        } catch (Exception e) {
            System.out.println(e.getLocalizedMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<String> deletePost(@PathVariable(value = "id") Long id,
                                             Authentication authentication) {
        String message = userService.deletePost(id, getEmailFromAuth(authentication));
        return ResponseEntity.ok().body(message);
    }

    @GetMapping("/search")
    public ResponseEntity<FullResults> getFullSearchResults(@RequestParam(value = "keyword") String keyword,
                                                            @RequestParam(value = "page") Integer page,
                                                            Authentication authentication) {
        return ResponseEntity.ok().body(userService.getFullSearchResults(keyword, page, getEmailFromAuth(authentication)));
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<User>> queryUsers(@RequestParam(value = "keyword") String keyword,
                                                 @RequestParam(value = "page") Integer page,
                                                 Authentication authentication) {
        return ResponseEntity.ok().body(userService.userSearchResults(keyword, page, getEmailFromAuth(authentication)));
    }

    @GetMapping("/posts/search")
    public ResponseEntity<List<PostDTO>> queryPosts(@RequestParam(value = "keyword") String keyword,
                                                    @RequestParam(value = "page") Integer page,
                                                    Authentication authentication) {
        return ResponseEntity.ok().body(userService.postSearchResults(keyword, page, getEmailFromAuth(authentication)));
    }

    public String getEmailFromAuth(Authentication authentication) {
        String email = null; //code to extract user from auth
        if(authentication == null) {
            return null;
        }
        if(authentication.getPrincipal() instanceof OAuth2User) {
            CustomOAuth2User customOAuth2User = (CustomOAuth2User) authentication.getPrincipal();
            email = customOAuth2User.getEmail();
        }
        else {
            if(authentication.getPrincipal() instanceof UserDetails) {
                CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
                email = customUserDetails.getEmail();
            }
            else{
                System.out.println("User has not logged in?");
                throw new IllegalStateException("Something went wrong...");
            }
        }
        return email;
    }

}
//do not forget to add a new endpoint to the WHITE_LIST_URLS in the security config